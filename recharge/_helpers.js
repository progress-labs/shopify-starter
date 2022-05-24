function renderSubscriptionProductInfo(product, price, quantity = 1, variantId = null) {
    let imageSrc = getImageUrl(product, variantId);

    let settings = {{ settings | json }};

    return `
        <div class="element__flex-column">
            <div>
                <img src="${imageSrc}" class="variant-image" alt="${ product.shopify_details.title.replace('Auto renew', '')}">
            </div>

            <h4>
                ${product.shopify_details.title.replace('Auto renew', '')}
            </h4>

            <div class="flex-center">
                <span class="js-rc_product_icon margin-right-5"> </span>
                <span id="variant-price" class="text-font-14 js-product-price" data-price="${price}">
                    ${getCurrency()}${Number(price).toFixed(2)}
                </span>
            </div>
        </div>

        <label class="text-font-14">Quantity</label>
        <div class="rc_product_quantity border-light" onclick="quantityHandler(event)">
            <span class="button-minus" style="pointer-events:none">-</span>
            <input type="number" value="${quantity}" min="1" name="quantity" id="variant_quantity" style="pointer-events:none;" class="text-center align-self-center">
            <span value="+" class="button-plus" style="${settings.customer_portal.subscription.change_quantity ? '' : 'pointer-events:none' }">+</span>
        </div>
        <br>
    `;
}

function renderLineItems(subscriptionId, subDate) {

    let charges = JSON.parse(sessionStorage.getItem('rc_charges'));
    let lineItems;
    const container = document.querySelector('#ship__now--container');

    let filteredCharges = charges.filter(charge => {
        if(subDate == 'None') {
            return charge.status == 'ERROR';
        }
        return charge.scheduled_at == subDate;
    });

    lineItems = filteredCharges.map(charge => {
        return charge.line_items.map(line_item => {
        let products = JSON.parse(sessionStorage.getItem('rc_products'));

        let chosenProduct = products.find(prod => prod.shopify_details.shopify_id == line_item.shopify_product_id);
        let imageUrl = getImageUrl(chosenProduct, line_item.shopify_variant_id);

        return `
            <li class="charge-id" data-charge-id="${charge.id}">
                <div class="">
                    <div class="rc_image_container">
                        <img
                            src="${imageUrl}" class="variant-image image-size" alt="${ line_item.title.replace('Auto renew', '')}">
                    </div>
                    <h4>
                        ${line_item.title.replace('Auto renew', '')}
                    </h4>
                </div>
            </li>`
        }).join('')
    }).join('');

    container.innerHTML = `
        <div> Products in this charge: </div>
        <br>
        <ul class="line_items--container">
            ${lineItems}
        </ul>
        <br>
        ${filteredCharges[0].line_items.length > 1
            ?   `
                    <div> Do you want to ship all products or just this subscription? </div>
                    <br>
                    <div>
                        <button
                            class="rc_btn text-uppercase title-bold ship-now-btn"
                            data-subscription-id="${subscriptionId}"
                            data-type="all"
                        >
                            Ship all products
                        </button>
                    </div>
                    <div>
                        <button
                            class="rc_btn text-uppercase title-bold ship-now-btn"
                            data-subscription-id="${subscriptionId}"
                            data-type="one"
                        >
                            Ship just subscription
                        </button>
                    </div>
                `
            : `
            <div>
                <button
                    class="rc_btn text-uppercase title-bold ship-now-btn"
                    data-subscription-id="${subscriptionId}"
                    data-type="all"
                >
                    Order now
                </button>
            </div>`
        }
    `;
}

const vanillaCalendar = {
    activeDates: null,
    date: new Date(),
    todaysDate: new Date(),

    init: function (options) {
        this.month = options.month;
        this.next = options.next;
        this.previous = options.previous;
        this.label = options.label;
        this.options = options;
        this.date = new Date(options.date + "T20:00:00");
        this.selectedDate = new Date(this.date + 1);
        this.date.setDate(1);
        this.createMonth(this.date);
        this.createListeners();
    },

    createListeners: function () {
        let _this = this;
        this.next.addEventListener('click', function (e) {
        e.preventDefault();
        _this.clearCalendar();
        var nextMonth = _this.date.getMonth() + 1;
        _this.date.setMonth(nextMonth);
        _this.createMonth(_this.date);
        })
        // Clears the calendar and shows the previous month
        this.previous.addEventListener('click', function (e) {
        e.preventDefault();
        _this.clearCalendar();
        var prevMonth = _this.date.getMonth() - 1;
        _this.date.setMonth(prevMonth);
        _this.createMonth(_this.date);
        })
    },

    createDay: function (num, day, year) {

        let newDay = document.createElement('div');
        let dateEl = document.createElement('span');
        dateEl.innerHTML = num;
        newDay.className = 'vcal-date';
        newDay.setAttribute('data-calendar-date', this.date);

        newDay.setAttribute('data-month', this.date.toLocaleString('en-us', { month: 'long' }));
        newDay.setAttribute('data-day', this.date.getDate() + 1);
        // if it's the first day of the month
        if (num === 1) {
            if (day !== 0) {
                newDay.style.marginLeft = ((day) * 14.28) + '%';
            }
        }

        if (this.options.disablePastDays && this.date.getTime() <= this.todaysDate.getTime() - 1) {
            newDay.classList.add('vcal-date--disabled');
        } else {
            newDay.classList.add('vcal-date--active');
            newDay.setAttribute('data-calendar-status', 'active');
        }

        if (this.date.toString() === this.selectedDate.toString()) {
            newDay.classList.add('vcal-date--selected');
        }
        newDay.appendChild(dateEl);
        this.month.appendChild(newDay);
    },

    dateClicked: function () {
        let _this = this;
        this.activeDates = document.querySelectorAll(
        '[data-calendar-status="active"]'
        )
        for (var i = 0; i < this.activeDates.length; i++) {
            this.activeDates[i].addEventListener('click', function (event) {
                document.getElementById("next_charge_date")
                        .setAttribute('value', formatDate(this.dataset.calendarDate));
                _this.removeActiveClass();
                this.classList.add('vcal-date--selected');
            });
        }
    },

    createMonth: function (month) {
        let currentMonth = month.getMonth();
        while (month.getMonth() === currentMonth) {
            this.createDay(
                this.date.getDate(),
                this.date.getDay(),
                this.date.getFullYear()
            )
            this.date.setDate(month.getDate() + 1);
        }
        // while loop trips over and day is at 30/31, bring it back
        this.date.setDate(1);
        this.date.setMonth(month.getMonth() - 1);

        this.label.innerHTML =
        this.monthsAsString(month.getMonth()) + ' ' + this.date.getFullYear();
        this.dateClicked();
    },

    monthsAsString: function (monthIndex) {
        return [
            'January',
            'Febuary',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ][monthIndex]
    },

    clearCalendar: function () {
        this.month.innerHTML = '';
    },

    removeActiveClass: function () {
        for (var i = 0; i < this.activeDates.length; i++) {
            this.activeDates[i].classList.remove('vcal-date--selected')
        }
    }
}

function initCalendar(date) {
    // Fetch next shipment date
    let month = document.querySelectorAll('[data-calendar-area="month"]')[0];
    let next = document.querySelectorAll('[data-calendar-toggle="next"]')[0];
    let previous = document.querySelectorAll('[data-calendar-toggle="previous"]')[0];
    let label = document.querySelectorAll('[data-calendar-label="month"]')[0];

    vanillaCalendar.init({
        date,
        disablePastDays: true,
        month,
        next,
        previous,
        label
    });
    document.querySelector("#next_charge_date").setAttribute('value', date);
}

function quantityHandler(evt) {
    evt.preventDefault();

    let settings = {{ settings | json }};

    if (settings.customer_portal.subscription.change_quantity) {
        let decrementButton = document.querySelector(".button-minus");
        let incrementButton = document.querySelector(".button-plus");
        let quantityElement = document.querySelector("[name=quantity]");

        // Update quantity element value
        if (evt.target.className.includes("button-plus")) {
            quantityElement.value++;
        } else if (evt.target.className.includes("button-minus")) {
            quantityElement.value--;
        }

        // Update buttons styles
        if (quantityElement.value == 1) {
            decrementButton.setAttribute("style", "pointer-events:none");
            incrementButton.setAttribute("style", "pointer: cursor");
        } else if (quantityElement.value > 1) {
            decrementButton.setAttribute("style", "pointer: cursor");
            incrementButton.setAttribute("style", "pointer: cursor");
        }

        // Update display price
        let priceElement = document.querySelector(".js-product-price");
        let price = quantityElement.value * Number(priceElement.dataset.price);
        priceElement.innerHTML = `${getCurrency()}${price.toFixed(2)}`;
    }
}

function updatePrice(product, purchaseType, price, quantity=1) {
    let newPrice = price;

    const hasDiscount = product.discount_amount && product.discount_amount !== 0 || false;

    if (purchaseType === 'subscription' && hasDiscount) {
        if (product.discount_type == 'percentage') {
            newPrice *= 1 - product.discount_amount / 100;
        } else {
            newPrice -= product.discount_amount;
        }
    }

    // Update data value so that quantity change callback uses the correct value
    updatePriceElementDataValue(newPrice);

    let icon;
    // Update icon when purchase type changes
    if (purchaseType === 'subscription') {
        icon = `{% include '_subscription-icon.svg' %}`;
    } else {
        icon = `{% include '_onetime-icon.svg' %}`;
    }

    document.querySelector('.js-rc_product_icon').innerHTML = icon;

    if (quantity !== 1) {
        newPrice *= quantity;
    }

    document.querySelector(
        "#variant-price"
    ).innerHTML = `${getCurrency()}${Number(newPrice).toFixed(2)}`;
}

function getDisplayPrice(product) {
    // This calculates the first displaying price on most of the templates/forms
    let price = product.shopify_details.variants[0].price;
    const hasDiscount = product.discount_amount && product.discount_amount !== 0 || false;
    const storeSettings = {{ settings | json }};

    if (!product.subscription_defaults || storeSettings.customer_portal.onetime.enabled) {
        // If we don't have subscription_defaults object or onetimes are enabled for the store, display normal price
        return price;
    }

    // Calculate discounted price if applicable
    if (hasDiscount) {
        if (product.discount_type == 'percentage') {
            price *= 1 - product.discount_amount / 100;
        } else {
            price -= product.discount_amount;
        }
    }

    return price;
}

function updatePriceElementDataValue(newPrice) {
    // Update price element data value
    let productPriceElement = document.querySelector(".js-product-price");
    productPriceElement.dataset.price = newPrice;
}

function triggerVariantUpdate() {
    const selectEl = document.querySelector("#product_options_container .rc_option__selector");

    selectEl.dispatchEvent(new Event('change'));
}

function updateVariant(evt) {
    evt.preventDefault();
    const productId = evt.target.dataset.productId;
    const products = JSON.parse(sessionStorage.getItem("rc_products"));
    const product = products.find(prod => prod.shopify_details.shopify_id == productId);

    // Get new variant title
    const newVariantTitle = Array.from(
        document.querySelectorAll(".rc_option__selector")
    )
        .map(select => select.value)
        .join(" / ");

    // Find the matching variant object by title
    const newVariant = product.shopify_details.variants.find(
        variant => variant.title === newVariantTitle
    );

    let variantInput = document.querySelector("input[name='shopify_variant_id']");
    const form = variantInput.parentElement;
    const formAction = form.getAttribute('action');
    const submitBtn = form.querySelector('button[type="submit"]');

  	if (newVariant){
        submitBtn.disabled = false;
        formAction.includes('swap')
            ? submitBtn.innerText = 'Swap product'
            : submitBtn.innerText = 'Add product'
        ;

        // Change product image when variant changes
        let variantImage = getImageUrl(product, newVariant.shopify_id);
        document.querySelector(".variant-image").setAttribute("src", variantImage);

        // Update variant id
        variantInput.value = newVariant.shopify_id;

        // Get selected purchase type
        let purchaseType = getSelectedPurchaseType();

        // Get current quantity
        let quantity = 1;
        if (document.querySelector("[name=quantity]")) {
            quantity = document.querySelector("[name=quantity]").value;
        }

        // Update price
        updatePrice(product, purchaseType, newVariant.price, quantity);

    } else {
        submitBtn.disabled = true;
        submitBtn.innerText = 'Unavailable';
    }
}

function getSelectedPurchaseType() {
    const purchaseTypeElement = document.querySelector(
        '[name="purchase_type"]:checked'
    );

    // Use the selected purchase type element if it exists on the form
    if (purchaseTypeElement) {
        return purchaseTypeElement.value;
    }

    // Use the form action url as a fallback
    const formAction = document
        .querySelector("#subscriptionNewForm, #subscriptionSwapForm")
        .getAttribute("action");

    return formAction.includes("/onetimes") ? "onetime" : "subscription";
}

function renderDeliveryOptions(product) {
    let intervalFrequency, deliveryOptions;

    if(product.subscription_defaults) {
        let { order_interval_frequency_options, charge_interval_frequency, order_interval_unit } = product.subscription_defaults;
        // Handle a scenario where ruleset is not sorted out
        if(order_interval_frequency_options.length > 1) {
          charge_interval_frequency = order_interval_frequency_options[0];
        }

        order_interval_frequency_options.forEach(
            frequency => intervalFrequency += `<option value="${frequency}">${frequency} </option>`
        );

        deliveryOptions = `
            <div>
                <label for="charge_interval_frequency" class="text-font-14">
                    Delivery schedule:
                </label>
                <input type="hidden" name="charge_interval_frequency" value="${charge_interval_frequency}">
                <div class="rc_input_container">
                <select
                    name="order_interval_frequency"
                    class="charge_interval_frequency"
                    onchange="document.querySelector('[name=charge_interval_frequency]').value=this.value"
                >
                    ${intervalFrequency}
                </select>

                <select name="order_interval_unit" class="order_interval_unit">
                    <option value="${order_interval_unit}">
                        ${order_interval_unit}
                    </option>
                </select>
                </div>
            </div>
        `;
    } else {
        deliveryOptions = '';
    }

    return deliveryOptions;
}

function renderPurchaseOptions(product, settings) {

    const { shopify_id } = product.shopify_details;

    let purchaseOptions = '';

    if(settings.customer_portal.onetime.enabled) {
        if(product.subscription_defaults) {
            if(product.subscription_defaults.storefront_purchase_options.includes('onetime')) {
                return purchaseOptions += `
                    ${renderPurchasenOption(shopify_id, true)}

                    ${renderPurchasenOption(shopify_id, false, 'onetime')}
                `;
            } else {
                return purchaseOptions += `${renderPurchasenOption(shopify_id, true)}`;
            }
        } else {
            return purchaseOptions += `${renderPurchasenOption(shopify_id, true, 'onetime')}`;
        }
    } else {
        let scheduleContainer = document.querySelector('#product_schedule_container');
        scheduleContainer != null ? scheduleContainer.style.display = 'none' : '';
        return purchaseOptions += `${renderPurchasenOption(shopify_id, true)}`;
    }
}

function renderPurchasenOption(id, checked=false, value='subscription') {
    return `
        <div class="rc_purchase_type border-light">
            <input
                type="radio"
                id="${value}"
                name="purchase_type"
                value="${value}"
                ${checked ? 'checked': ''}
                onchange="optionChangeCallback(event)"
                data-id="${id}"
            >
            ${value === 'subscription'
                ? `<label for="${value}">{{ 'Subscribe' | t }}</label>`
                : `<label for="${value}">{{ 'One_time_purchase' | t }}</label>`
            }
        </div>
        <br>
    `;
}

function renderVariants(product) {

    let optionsContainer = document.querySelector('#product_options_container');

    if (product.shopify_details.options.length) {
        return product.shopify_details.options.map(option => {
            let values = option.values.map(value => `<option value="${value}"> ${value} </option>`);

            return optionsContainer.innerHTML += `
                <li class="rc_option">
                    <label for="option_${option.shopify_id}" class="text-font-14">${option.name}:</label>
                    <select
                        id="option_${option.shopify_id}"
                        class="rc_option__selector"
                        onchange="updateVariant(event)"
                        data-product-id=${product.shopify_details.shopify_id}
                    >
                        ${values.join('')}
                    </select>
                </li>
            `;
        });
    }

    let variants = product.shopify_details.variants.map(value => `
        <option value="${value.title}">
            ${value.title !== ''
                ? value.title
                : 'Default title'
            }
        </option>
    `);

    return optionsContainer.innerHTML += `
        <li class="rc_option">
            <select
                id="option_${product.shopify_details.shopify_id}"
                class="rc_option__selector"
                onchange="updateVariant(event)"
                data-product-id=${product.shopify_details.shopify_id}
            >
                ${variants.join('')}
            </select>
        </li>
    `;
}

function updateNextChargeDate () {
    const addressId = document.querySelector('#address_id').value;
    const chosenAddress = ReCharge.Novum.addresses.find(address => address.id == addressId);
    let datesArray = [];

    if (chosenAddress.subscriptions.length) {
        chosenAddress.subscriptions.map(sub => {
            if(sub.status == "ACTIVE" && sub.next_charge_scheduled_at) {
                let formattedDate = sub.next_charge_scheduled_at.split('T')[0];
                datesArray.push(formattedDate);
            }
        });
    }

    let sortedDates = datesArray.sort().filter(function(item, pos, ary) {
        return !pos || item != ary[pos - 1];
    });
    sortedDates.push('custom');

    let datesContainer = document.querySelector('#product_dates_container');
    let dateValues = sortedDates.map(date => {
        if (date === 'custom') {
            return `<option value="custom">{{ 'custom_charge_date' | t }}</option>`;
        }
        if (date != 'custom') {
            return `<option value="${date}">${date}</option>`;
        }
    });

    datesContainer.innerHTML = `
        <label for="address_charge_dates" class="text-font-14">{{ 'First_shipment_date' | t }}</label>
        <select id="address_charge_dates" onchange="renderCustomDate(event)">
            ${dateValues}
        </select>
    `;

    let nextChargeContainer = document.querySelector('#next_charge_date_container');
    let nextChargeDateInput = document.querySelector('[name=next_charge_scheduled_at]');

    if(sortedDates[0] === 'custom') {
        nextChargeContainer.style.display = 'block';
        nextChargeDateInput.value = formatDate(new Date());
    } else {
        nextChargeContainer.style.display = 'none';
        nextChargeDateInput.value = sortedDates[0];
    }
}

function renderCustomDate(evt) {
    evt.preventDefault();

    let nextChargeContainer = document.querySelector('#next_charge_date_container');
    let nextChargeDateInput = document.querySelector('[name=next_charge_scheduled_at]');

    if(evt.target.value.toLowerCase().includes('custom')) {
        nextChargeContainer.style.display = 'block';
        nextChargeDateInput.value = formatDate(new Date());
    } else {
        nextChargeDateInput.value = evt.target.value;
        nextChargeContainer.style.display = 'none';
    }
}

function searchProductsHandler(evt, action = 'add') {
    if (evt.keyCode === 13) {
        evt.preventDefault();

        let productsContainer = document.querySelector('.rc_product_list_container');
        const searchValue = evt.target.value;

        let productsToRender;

        productsToRender = isOnetimesEnabled(JSON.parse(sessionStorage.getItem('rc_products')));

        const filteredProducts = productsToRender.filter(product => product.shopify_details.title.toLowerCase().includes(searchValue.toLowerCase()));

        if(filteredProducts.length < 1) {
            productsContainer.innerHTML = 'No products found';
        } else {
            productsContainer.innerHTML = '';
            renderProducts(filteredProducts, action);
        }
    }
}

function renderUpsells(type = 'upsell', products, currentPage = 1, productsPerPage = 12) {
    const container = document.querySelector('#rc__upsells--container');
    // Hide loader
    document.querySelector('#upsells--loader').setAttribute('style', 'display: none;');

    let productCards = '';
    let productsToRender = isOnetimesEnabled(products);

    renderPagination(productsToRender, currentPage, type, productsPerPage);

    if (products.length) {
        productCards = productsToRender
            .slice(0, 12)
            .map(product => {
                let imageSrc = getImageUrl(product);
                let price = getDisplayPrice(product);

                const { shopify_id, handle, title } = product.shopify_details;

                return `
                        <li class="js-toggle-card text-center rc_element_wrapper rc_single_product_card-wrapper" id="product_${shopify_id}">
                            <div class="js-card js-card-${shopify_id}">
                                <div class="rc_image_container">
                                    <img src="${imageSrc}" alt="${handle}">
                                </div>

                                <p
                                    class="text-font-14 title-bold upsells-title ${title.replace('Auto renew', '').trim().length > 45 ? 'upsell_text--clip' : 'upsell_text--center'}"
                                >
                                    ${title.replace('Auto renew', '')}
                                </p>

                                <p>
                                    ${getCurrency()}${Number(price).toFixed(2)}
                                </p>

                                <button
                                    class="rc_btn--secondary text-uppercase title-bold upsell-btn-mobile"
                                    data-product-id="${shopify_id}"
                                    onclick="toggleUpsellsButtons(event)"
                                >
                                    Add
                                </button>
                            </div>
                            ${renderUpsellButtons(product)}
                        </li>
                    `;
            }).join('');
    }

    container.innerHTML = `${productCards}`;
}

function toggleUpsellsButtons(evt) {
    evt.preventDefault();

    const id = evt.target.dataset.productId;
    const parent = evt.target.closest('.js-toggle-card');

    let styles = `background: var(--primary-color); display: flex; justify-content: center;`;

    document.querySelector(`.js-card-${id}`).style.display = 'none';
    document.querySelector(`.js-button-${id}`)
            .setAttribute('style', `display: block; display: flex; flex-direction: column; justify-content: space-evenly; min-height: 210px; width: 100%;`);

    parent.setAttribute('style', styles);
}

function renderUpsellButtons(product) {
    let buttons = '';
    let storeSettings = {{ settings | json }};

    const { shopify_id } = product.shopify_details;

    if (!product.subscription_defaults) {
        buttons += `
            <p
                class="rc_upsells-btns js-button-${shopify_id}"
                data-product-id="${shopify_id}"
                onclick="addUpsellHandler(event)"
            >
                <input type="button" value="Add one-time" class="title-bold">
            </p>
        `;
    } else {
        if (!storeSettings.customer_portal.onetime.enabled) {
            buttons += `
                <p
                    class="rc_upsells-btns js-button-${shopify_id}"
                    data-product-id="${shopify_id}"
                    onclick="addUpsellHandler(event)"
                >
                    <input type="button" value="Add subscription" class="title-bold">
                </p>
            `;
        } else {
            if (product.subscription_defaults.storefront_purchase_options.includes('onetime')) {
                buttons += `
                    <p
                        class="rc_upsells-btns js-button-${shopify_id}"
                        data-product-id="${shopify_id}"
                        onclick="addUpsellHandler(event)"
                    >
                        <input type="button" value="Add one-time" class="title-bold">
                        <input type="button" value="Add subscription" class="title-bold">
                    </p>
                `;
            } else {
                buttons += `
                    <p
                        class="rc_upsells-btns js-button-${shopify_id}"
                        data-product-id="${shopify_id}"
                        onclick="addUpsellHandler(event)"
                    >
                        <input type="button" value="Add subscription" class="title-bold">
                    </p>
                `;
            }
        }
    }

    return buttons;
}

function addUpsellHandler(evt) {
    evt.preventDefault();

    const chosenOption = evt.target.value;
    const parentElement = evt.target.closest('.rc_upsells-btns');
    const productId = parentElement.dataset.productId;
    const products = JSON.parse(sessionStorage.getItem('rc_products'));
    const settings = {{ settings | json }};
    const chosenProduct = products.find(product => product.shopify_details.shopify_id == productId);
    const subscription = ReCharge.Novum.subscription;
    let url = chosenOption.includes('one-time') ? "{{ onetime_list_url }}" : "{{ subscription_list_url }}";
    let isInStock;

    if (chosenProduct.shopify_details.variants.length > 1) {
        ReCharge.Novum.sidebarHeading.innerHTML = 'Add product';
        ReCharge.Novum.sidebarContent.innerHTML = `{% include '_add_product_details.html' %}`;

        let productContainer = document.querySelector('.rc_add_product_details_container');

        productContainer.innerHTML += `
            <input type="hidden" name="shopify_variant_id" value="${chosenProduct.shopify_details.variants[0].shopify_id}">
            ${ReCharge.Novum.store.external_platform === 'big_commerce'
                ? `<input type="hidden" name="external_product_id" value="${chosenProduct.shopify_details.shopify_id}">`
                : ``
            }
            <input type="hidden" name="next_charge_scheduled_at" id="next_charge_scheduled_at" value="${subscription.next_charge_scheduled_at}" required >
            <input type="hidden" name="address_id" value="${subscription.address_id}" required >

            ${!chosenOption.includes('one-time') ? '' :
                `<input type="hidden" name="redirect_url" value="{{ schedule_url }}">
                <input type="hidden" name="properties[add_on]" value="True">
                <input type="hidden" name="properties[add_on_subscription_id]" value="${subscription.id}">
                `
            }

            ${renderSubscriptionProductInfo(chosenProduct, getDisplayPrice(chosenProduct))}

            ${chosenOption.includes('one-time') ? '' :
                `<div id="product_schedule_container">
                    ${renderDeliveryOptions(chosenProduct)}
                </div>`
            }

            <div id="product_variant_container">
                <h4>Variants</h4>
                <ul id="product_options_container"></ul>
            </div>
            <button type="submit" class="rc_btn text-uppercase title-bold">
                ${evt.target.value}
            </button>
        `;

        renderVariants(chosenProduct);
        document.querySelector('#subscriptionNewForm').setAttribute('action', url);

        // Trigger the variant change callback to ensure correct price display
        triggerVariantUpdate();

        // Add handler for subscription/otp creation
        document.querySelector('#subscriptionNewForm')
                .addEventListener('submit', (e) => createProduct(e, chosenProduct.shopify_details.shopify_id));

        ReCharge.Novum.toggleSidebar();
    } else {
        isInStock = checkInventory(chosenProduct.shopify_details.variants[0]);
        if (isInStock) {
            evt.target.value = "Processing...";
            evt.target.disabled = true;
            let postUrl = 'create_onetime';
            const data = {
                address_id: subscription.address_id,
                external_product_id: chosenProduct.shopify_details.shopify_id,
                shopify_variant_id: chosenProduct.shopify_details.variants[0].shopify_id,
                quantity: 1,
                next_charge_scheduled_at: subscription.next_charge_scheduled_at,
                "properties[add_on]": true,
                "properties[add_on_subscription_id]": subscription.id,
            }

            if (chosenOption.includes('subscription')) {
                postUrl = 'list_subscriptions_url';

                data.order_interval_frequency = chosenProduct.subscription_defaults.order_interval_frequency_options[0];
                data.charge_interval_frequency = chosenProduct.subscription_defaults.order_interval_frequency_options.length > 1
                  ? chosenProduct.subscription_defaults.order_interval_frequency_options[0]
                  : chosenProduct.subscription_defaults.charge_interval_frequency
                ;
                data.order_interval_unit = chosenProduct.subscription_defaults.order_interval_unit;
            }

            data.redirect_url = "{{ schedule_url }}";

            ReCharge.Actions.put(postUrl, null, data);
        } else {
            evt.target.value = "Out of stock";
            evt.target.disabled = true;
            ReCharge.Toast.addToast("error", `Product out of stock.`);
        }
    }
}

/* Show all products in modal */
function renderProducts(products, type, currentPage=1, productsPerPage=6) {
    renderPagination(products, currentPage, type, productsPerPage);

    const productsContainer = document.querySelector('.rc_product_list_container');

    products.forEach(product => {
		console.log(product);
        let otpPrice = product.shopify_details.variants[0].price;
        let subPrice = product.shopify_details.variants[0].price;

        if (product.subscription_defaults) {
            const hasDiscount = product.discount_amount && product.discount_amount !== 0 || false;
            if (hasDiscount) {
                if (product.discount_type == 'percentage') {
                    subPrice *= 1 - product.discount_amount / 100;
                } else {
                    subPrice -= product.discount_amount;
                }
            }
        }

        const { title, shopify_id } = product.shopify_details;

        productsContainer.innerHTML += `
            <li class="rc_product_card border-light text-center rc_single_product_card-wrapper" id="product_${shopify_id}">
                <div class="rc_image_container">
                    <img src="${getImageUrl(product)}" alt="${product.title}" class="rc_img__sidebar" height="100px" width="100px">
                </div>

                <p class="product-title title-bold ${title.trim().length > 35 ? 'upsell_text--clip' : 'upsell_text--center'}">
                    ${title}
                </p>

                <p>
                    {% include '_onetime-icon.svg' %}
                    ${getCurrency()}${Number(otpPrice).toFixed(2)}
                    <svg class="vertical-divider" width="1" height="9" fill="none"><path d="M.962 8.553H.234V.125h.728v8.428z" fill="var(--color-dark-green)"/></svg>
                    {% include '_subscription-icon.svg' %}
                    ${getCurrency()}${Number(subPrice).toFixed(2)}
                </p>
                <button
                    class="rc_btn text-uppercase title-bold view-product-button btn"
                    data-product-id="${shopify_id}"
                >
                    Select
                </button>
            </li>
        `;
    });

    let handler = addProductDetailsHandler;

    if (type === 'swap') {
        handler = swapProductDetailsHandler;
    }

    document.querySelectorAll('.view-product-button')
        .forEach(button => {
            button.addEventListener('click', handler)
        });
}

function renderPagination(products, currentPage, type, productsPerPage) {
    let productss = JSON.parse(sessionStorage.getItem('rc_products'));
    let settings = {{ settings | json }};
    let productsToRender, buttonsContainer;

    productsToRender = isOnetimesEnabled(productss);
    if(type === 'swap') {
        productsToRender = [...productss].filter(prod => prod.subscription_defaults && prod.subscription_defaults.charge_interval_frequency == prod.subscription_defaults.order_interval_frequency_options[0]);
    }

    let productCount = productsToRender.length;
    let numberOfPages = Math.ceil(productCount / productsPerPage);

    const pageNumbers = [];
    for(var i = 1; i <= numberOfPages; i++) {
        pageNumbers.push(i);
    }

    if(type === 'upsell') {
        buttonsContainer = document.querySelector('.rc__upsells--pagination_buttons_container');
    } else {
        buttonsContainer = document.querySelector('.pagination_buttons_container');
    }

    buttonsContainer.innerHTML = '';

    if(productCount > productsPerPage) {
        pageNumbers.forEach(page => {
            buttonsContainer.innerHTML += `
                <li
                    style="cursor: pointer; ${currentPage == page ? 'background-color: var(--color-light-green); border-radius:50%; color: var(--color-white); width: 25px; height: 25px; text-align: center;' : '' }"
                    class="pagination-btn"
                    onclick="goToPageHandler(event)"
                    data-page="${page}"
                    data-action-type="${type}"
                >
                    ${page}
                </li>
            `;
        });
    }
}

function goToPageHandler(evt, productsPerPage=6) {

    let products = JSON.parse(sessionStorage.getItem('rc_products'));
    let productsToRender = isOnetimesEnabled(products);

    const currentPage = Number(evt.target.dataset.page);
    const type = evt.target.dataset.actionType;
    let startPoint = currentPage * productsPerPage - productsPerPage;
    let endPoint = currentPage * productsPerPage;

    if(type === 'swap') {
        productsToRender = [...products].filter(prod => prod.subscription_defaults && prod.subscription_defaults.charge_interval_frequency == prod.subscription_defaults.order_interval_frequency_options[0] );
    }

    let paginationProducts = productsToRender.slice(startPoint, endPoint);

    if(type === 'upsell') {
        let upsellsList = document.querySelector('#rc__upsells--container');
        if(upsellsList != null) {
            upsellsList.innerHTML = '';
            productsPerPage = 12;
            startPoint = currentPage * productsPerPage - productsPerPage;
            endPoint = currentPage * productsPerPage;
            paginationProducts = productsToRender.slice(startPoint, endPoint);

            renderUpsells(type, paginationProducts, currentPage);
        }
    } else {
        let productList = document.querySelector('.rc_product_list_container');
        if(productList != null) {
            productList.innerHTML = '';
            renderProducts(paginationProducts, type, currentPage);
        }
    }
}

function showElement(el) {
    el.setAttribute('style', 'display: inline-block');
}


class MissingReChargeDataError extends Error {
    constructor(message) {
        super(message);
        this.name = 'MissingReChargeDataError';
    }
}

function validateResponseData(data, type = 'initial') {
    let requiredData = ["products", "orders", "retention_strategies"];


    if (type === 'countries') {
        requiredData = ["shipping_countries", "billing_countries"];
    } else if (type === 'charges') {
        requiredData = ["charges", "onetimes"];
    } else if (type === 'products') {
        requiredData = ["products"];
    }

    if (!data) {
        throw new MissingReChargeDataError(
            `Missing response data from response`
        );
    }

    const fieldsPresent = Object.keys(data);
    const missingFields = requiredData.filter(
        field => !fieldsPresent.includes(field)
    );

    if (missingFields.length) {
        const missingFieldsMessage = missingFields
            .map(field => `"${field}"`)
            .join();
        throw new MissingReChargeDataError(
            `Missing ${missingFieldsMessage} data from response`
        );
    }
}

async function fetchProductsRetentionStrategiesOrders() {
    const settings = {{ settings | json }};
    const store = {{ store | json }};
    let schema = `{ "products": { "base_source": "store_settings", "limit": 250, "page": 1 }, "retention_strategies": {"sort_by":"id-asc"}, "orders": {"status": "SUCCESS"} }`;

    if (store.external_platform === 'big_commerce') {
        schema = `{ "products": { "limit": 250, "page": 1 }, "retention_strategies": {"sort_by":"id-asc"}, "orders": {"status": "SUCCESS"} }`;
    }

    try {
        const url = `${ReCharge.Endpoints.request_objects()}&schema=${schema}`;
        const response = await axios(url);

        validateResponseData(response.data);

        let mappedProducts = response.data.products;
        if (store.external_platform === 'big_commerce') {
            mappedProducts = mapProducts(mappedProducts);
        }
        sessionStorage.setItem("rc_products", JSON.stringify(mappedProducts));

        sessionStorage.setItem("rc_retention_strategies", JSON.stringify(response.data.retention_strategies));
        sessionStorage.setItem("rc_orders", JSON.stringify(response.data.orders));

        if (mappedProducts && mappedProducts.length >= 250) {
            triggerProductPagination(2);
        }

        const { orders } = response.data;

        // render onetimes
        let container = document.querySelector('#rc__upsells--container');
        const upsellWrapper = document.querySelector(".upsells--wrapper") || null;
        if (container && mappedProducts.length > 0 ) {
            renderUpsells("upsell", mappedProducts);
        } else {
            if(upsellWrapper !== null) {
                upsellWrapper.innerHTML = ReCharge.Utils.renderNoProductsLayout();
            }
        }

        // check if store allows cancellation
        const cancelBtn = document.querySelector(".js-cancel-sub-btn") || null;
        if (cancelBtn !== null) {
            ReCharge.Utils.checkIfStoreAllowsCancellation(orders, cancelBtn);
        }
    } catch(error) {
        console.error(error);

        const upsellWrapper = document.querySelector(".upsells--wrapper") || null;
        if(upsellWrapper !== null) {
            upsellWrapper.innerHTML = ReCharge.Utils.renderNoProductsLayout();
        }
    }
}

async function fetchChargesOnetimes() {
    const schema = `{ "charges": {"address_id": "${ ReCharge.Novum.subscription.address_id }", "subscription_id": "${ ReCharge.Novum.subscription.id }", "status": "QUEUED" }, "onetimes": [] }`;

    try {
        const url = `${ReCharge.Endpoints.request_objects()}&schema=${schema}`;
        const response = await axios(url);

        validateResponseData(response.data, 'charges');

        sessionStorage.setItem('rc_charges', JSON.stringify(response.data.charges));
        sessionStorage.setItem('rc_onetimes', JSON.stringify(response.data.onetimes));

        if (
                ReCharge.Novum.subscription.address.discount_id &&
                ReCharge.Novum.subscription.status == "ACTIVE"
            ) {
                buildDiscountCard(ReCharge.Novum.subscription.address.discount_id);
        }

    } catch (error) {
        console.error(error);
    }
}

async function fetchProducts(page) {
    const store = {{ store | json }};
    let schema = `{ "products": { "base_source": "store_settings", "limit": 250, "page": ${page} } }`;

    if (store.external_platform === 'big_commerce') {
        schema = `{ "products": { "limit": 250, "page": ${page} } }`;
    }

    try {
        const url = `${ReCharge.Endpoints.request_objects()}&schema=${schema}`;
        const response = await axios(url);

        validateResponseData(response.data, 'products');

        let rc_products = JSON.parse(sessionStorage.getItem("rc_products"));
        let mappedProducts = response.data.products;

        if (store.external_platform === 'big_commerce') {
            mappedProducts = mapProducts(mappedProducts);
        }

        if (mappedProducts.length) {
            let combinedProducts = rc_products.concat(mappedProducts);
            sessionStorage.setItem('rc_products', JSON.stringify(combinedProducts));
        }

        if (mappedProducts.length >= 250) {
            triggerProductPagination(Number(page) + 1);
        }

    } catch (error) {
        console.error(error);
    }
}

function triggerProductPagination(page) {
    fetchProducts(page);
}
