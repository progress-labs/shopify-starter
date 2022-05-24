function formatDate(date) {
    let d = new Date(date),
        month = "" + (d.getMonth() + 1),
        day = "" + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = "0" + month;
    if (day.length < 2) day = "0" + day;

    return [year, month, day].join("-");
}

function getImageUrl(product, shopifyVariantId=null) {
    const store = {{ store | json }};
    let imageSrc;

    const { variants, images } = product.shopify_details;

    console.log({images});

    if (store.external_platform === 'big_commerce') {
        if (product && images && images[0] && images[0].small ) {
            console.log(1);
            imageSrc = images[0].small;
        } else if (product && images && images[0] && images[0].src) {
            console.log(2);
            imageSrc = images[images.length-1].src;
        }  else {
            imageSrc =
                "//rechargestatic-bootstrapheroes.netdna-ssl.com/static/images/no-image.png";
        }
    } else {
        if ( product && images && images[0] ) {
            if (shopifyVariantId !== null) {
                const currentVariant = variants.find(
                variant => variant.shopify_id == shopifyVariantId
                );

                if (currentVariant) {
                    let variantImage = images.find(
                        image => image.shopify_id == currentVariant.shopify_image_id
                    );
                    if (variantImage != null) {
                        imageSrc = variantImage.src;
                    } else {
                        imageSrc = images[0]["src"];
                    }
                } else {
                    imageSrc = images[0]["src"];
                }
            } else {
                imageSrc = images[0]["src"];
            }
        } else {
            imageSrc =
                "//rechargestatic-bootstrapheroes.netdna-ssl.com/static/images/no-image.png";
        }
    }

    return imageSrc;
}

function toggleSubscriptionUI() {
    let productScheduleContainer = document.querySelector("#product_schedule_container");

    if (
        document.querySelector('[name="purchase_type"]:checked').value ===
            "onetime"
    ) {
        productScheduleContainer.style.display =
            "none";
    } else {
        productScheduleContainer.style.display =
            "block";
    }
}

function updateFormAction() {
    let subscriptionForm = document.querySelector("#subscriptionNewForm");

    if (
        document.querySelector('[name="purchase_type"]:checked').value ===
            "onetime"
    ) {
        subscriptionForm
            .setAttribute("action", "{{ onetime_list_url }}");

        document
            .querySelector('#js-add-product-redirect')
            .value = "{{ schedule_url }}";

    } else {
        subscriptionForm
            .setAttribute("action", "{{ subscription_list_url }}");

        document
            .querySelector('#js-add-product-redirect')
            .value = window.location.href;
    }
}

function optionChangeCallback(event) {
    // Trigger the variant change callback to ensure correct price display
    triggerVariantUpdate();
    toggleSubscriptionUI();
    updateFormAction();
}

function isOnetimesEnabled(products) {
    let productsToRender;
    const storeSettings = {{ settings | json }};

    if (storeSettings != null && storeSettings.customer_portal.onetime.enabled) {
        productsToRender = [...products];
    } else {
        productsToRender = [...products].filter(prod => prod.subscription_defaults);
    }

    return productsToRender;
}

function informCustomerHandler(evt) {
    evt.preventDefault();
    const value = evt.target.value;

    if (value === "ok") {
        document.querySelector("body").classList.toggle("locked");
        document
            .querySelectorAll(".info-modal")
            .forEach(el => el.setAttribute("style", "display: none;"));
    } else if (value === "cancel") {
        window.close();
    }
}

function getCurrency() {
    let moneySign = 'USD';

    if (window.Shopify) {
        moneySign = window.Shopify.currency.active;
    } else {
        const price = '{{ 0.00 | money_localized }}';
        const pattern = (/([\D|a-z]+)/);
        let priceSign = price.match(pattern);

        moneySign = priceSign[0];
    }

    switch (moneySign) {
        case 'USD':
        case 'AUD':
        case 'CAD':
            moneySign = '$';
            break;
        case 'GBP':
            moneySign = '£';
            break;
        case 'EUR':
            moneySign = '€';
            break;
        case 'INR':
            moneySign = '?';
            break;
        case 'SEK':
            moneySign = 'kr';
            break;
        case 'JPY':
            moneySign = '¥';
            break;
        default:
            moneySign = moneySign;
    }

    return moneySign;
}

function getZipLabel(country = "United States") {
    let zipLabel, provinceLabel;

    if (country === "US" || country === "United States") {
        zipLabel = "Zip code";
        provinceLabel = "State";
    } else if (country === "UK" || country === "United Kingdom") {
        zipLabel = "Postcode";
        provinceLabel = "Region";
    } else {
        zipLabel = "Postal code";
        provinceLabel = "Region";
    }

    let labels = document.querySelectorAll(".js-zipcode");
    if (labels) {
        labels.forEach(zip => {
            zip.innerHTML = zipLabel;
        });
    }

    let stateLabels = document.querySelectorAll('.js-statelabel');
    if (stateLabels) {
        stateLabels.forEach(state => {
            state.innerHTML = provinceLabel;
        });
    }
}

function isPrepaid(subscription) {
    return subscription && subscription.charge_interval_frequency !== subscription.order_interval_frequency;
}

function getNumberSuffix(num) {
    let j = num % 10;
    let k = num % 100;

    if (j == 1 && k != 11) {
        return "st";
    }
    if (j == 2 && k != 12) {
        return "nd";
    }
    if (j == 3 && k != 13) {
        return "rd";
    }
    return "th";
}

function addOnLayout() {
    const { properties } = ReCharge.Novum.subscription;
    let isAddOn;

    if (properties && properties.length) {
        isAddOn = properties.filter(prop => prop.name == "add_on")[0];

        if(isAddOn && isAddOn.name == "add_on") {
        let cards = document.querySelectorAll(".js-edit-next-charge-date, .js-address-edit, .js-edit-billing-address, .js-edit-billing-card");
        cards.forEach(elem => elem.style.pointerEvents = "none");

        let arrows = document.querySelectorAll(".js-edit-next-charge-date-btn, .js-address-edit-btn, .js-billing-edit-btn, .js-billing-card-edit-btn");
        arrows.forEach(arrow => arrow.style.display = "none");
        }
    }
}

function renderSubOnetimes(products) {

    const rc_products = JSON.parse(sessionStorage.getItem('rc_products'));

    return products.map(prod => {
        const { product, shopify_variant_id, product_title, status, variant_title, quantity, price } = prod;
        const chosenProduct = rc_products.filter(product => product.shopify_details.shopify_id == prod.shopify_product_id)[0];

        return `
            <div class="display-flex">
                <div class="rc_photo_container margin-right-20 margin-bottom-10">
                    <img src="${getImageUrl(chosenProduct, shopify_variant_id)}" alt="${product_title.replace('Auto renew', '')}">
                </div>

                <div class="rc_schedule_wrapper">
                    <div class="rc_order_title_container">
                        <span class="rc_order_title">${product_title.replace('Auto renew', '')}</span>
                    </div>

                    <p>
                        ${status == "ACTIVE" ? `{% include '_subscription-icon.svg' %} Subscription` :
                        `{% include '_onetime-icon.svg' %} Onetime`
                        }
                    </p>

                    ${!variant_title ? '' :
                        `<p>${variant_title}</p>`
                    }

                    <p>
                        Qty: ${quantity}
                    </p>

                    <p class="text-font-14">
                        ${getCurrency()}${price.toFixed(2)}
                    </p>
                </div>
            </div>
        `;
    }).join('');
}

function triggerSingleProductUpdate(event, actionUrl, name, value) {
    ReCharge.Forms.toggleSubmitButton(event.target);
    const dataToSend = { date: value };
    ReCharge.Actions.put('update_next_charge_date', actionUrl, dataToSend);
}

const syncUpload = {
    queue: [],
    upload: async function (otps, data, typeUrl, redirect = false) {
        otps.forEach(otp => {
            let url = ReCharge.Endpoints[typeUrl]([otp.id]);

            let request = {
                url,
                method: "post",
                data
            }

            this.queue.push(request);
        });

        this.uploadNext(redirect);
    },
    uploadNext: async function (redirect = false) {
        let queue = this.queue;
        if (queue && queue.length) {
            try {
                await axios(queue.shift(0));
                this.uploadNext(redirect);
            } catch (error) {
                console.error(error);
                ReCharge.Toast.addToast("error", `Unable to perform update.`);
                //ReCharge.Forms.toggleSubmitButton(event.target);
            }
        } else {
            ReCharge.Toast.addToast('success', 'Updates saved successfully!');

            if(redirect){
                window.location.href = "{{ schedule_url }}";
            }else{
                window.location.reload();
            }
        }
    }
}

async function bulkUpdateOnetimes(event, name, value, url) {
    event.preventDefault();
    ReCharge.Forms.toggleSubmitButton(event.target);

    if (window.locked) { return false; } else { window.locked = true; };
    const onetimes = JSON.parse(sessionStorage.getItem("rc_onetimes"));
    const data = { next_charge_scheduled_at: value };
    let subOnetimes;

    subOnetimes = onetimes
        .filter( otp =>
            otp.next_charge_scheduled_at === ReCharge.Novum.subscription.next_charge_scheduled_at &&
            otp.address_id === ReCharge.Novum.subscription.address_id
        );

    try {
        await axios({
            url,
            method: "post",
            data: { date: value }
        });

        syncUpload.upload(subOnetimes, data, 'onetime_charge_date_url');

    } catch (error) {
        console.error(error.response.data.error);
        ReCharge.Toast.addToast("error", `Unable to perform update.`);
        ReCharge.Forms.toggleSubmitButton(event.target);
    } finally {
        delete window.locked;
    }
}

async function bulkCancelAddonProducts(evt, url) {
    evt.preventDefault();
    ReCharge.Forms.toggleSubmitButton(evt.target.querySelector('button'));

    if (window.locked) { return false; } else { window.locked = true; };

    const { id, next_charge_scheduled_at, address_id } = ReCharge.Novum.subscription;
    let onetimes = JSON.parse(sessionStorage.getItem("rc_onetimes"));

    const onetimesToCancel = onetimes
        .filter(otp =>
            otp.next_charge_scheduled_at === next_charge_scheduled_at &&
            otp.address_id === address_id
        )
        .filter(otp => {
            if (otp.properties.length) {
                let propertiesAsString = JSON.stringify(otp.properties);
                if (
                    propertiesAsString.includes('add_on_subscription_id') &&
                    propertiesAsString.includes(id)
                ) {
                    return otp;
                } else if (
                    propertiesAsString.includes('add_on') &&
                    propertiesAsString.includes('True')
                ) {
                    return otp;
                }
            }
        }
    );

    try {
        await axios({
            url,
            method: "post",
            data: {
                'cancellation_reason': document.querySelector('[name=cancellation_reason]').value,
                'cancellation_reason_comments': document.querySelector('[name=cancellation_reason_comments]').value || ''
            }
        });

        if(onetimesToCancel){
            syncUpload.upload(onetimesToCancel, null, 'cancel_onetime_product', true);

        }

    } catch (error) {
        console.error(error);
        ReCharge.Toast.addToast("error", `Unable to perform update.`);
        ReCharge.Forms.toggleSubmitButton(evt.target);
    } finally {
        delete window.locked;
    }
}

function checkInventory(variant) {
    return  variant.inventory_quantity > 0
        ? true
        : ReCharge.Novum.settings.customer_portal.inventory_behaviour !== 'decrement_obeying_policy'
    ;
}

function renderOrderFrequencyOptions(unit, frequency) {
    let output = '';

    if (unit == 'day') {
        output = Array.from({length: 90},(_,x) => `<option value="${x + 1}" ${x + 1 == frequency ? 'selected' : ''}>${x + 1}</option>`);
    } else if (unit == 'week') {
        output = Array.from({length: 52},(_,x) => `<option value="${x + 1}" ${x + 1 == frequency ? 'selected' : ''}>${x + 1}</option>`);
    } else if (unit == 'month') {
        output = Array.from({length: 12},(_,x) => `<option value="${x + 1}" ${x + 1 == frequency ? 'selected' : ''}>${x + 1}</option>`);
    }

    return output;
}

function mapProducts(products) {

    return [...products].map(prod => {

        let options = prod.options.map(option => {
            let opt = {
                name: option.name,
                position: option.position,
                shopify_id: option.id,
                shopify_product_id: prod.external_product_id,
                values: []
            }
            option.values.map(val => opt.values.push(val.label));

            return opt;
        });

        let order_interval_frequency_options = [];

        if (prod.subscription_options && Object.keys(prod.subscription_options).length > 0) {
            order_interval_frequency_options = {...prod}.subscription_options.order_interval_frequency_options.split(',');
        }

        let variants = [];

        if (prod.variants.length) {
            variants = prod.variants.map(item => {
                let variant = {
                    barcode: "",
                    compare_at_price: item.prices.compare_at_price,
                    created_at: "",
                    fulfillment_service: null,
                    grams: 100,
                    inventory_management: item.inventory.inventory_tracking,
                    inventory_policy: item.inventory.inventory_policy,
                    inventory_quantity: item.inventory.inventory_level,
                    option1: item.option_values.length ? item.option_values[0].label : null,
                    option2: null,
                    option3: null,
                    position: 1,
                    presentment_prices: null,
                    price: item.prices.unit_price,
                    requires_shipping: null,
                    shopify_id: item.id,
                    shopify_image_id: null,
                    shopify_product_id: prod.external_product_id,
                    sku: item.sku,
                    taxable: item.taxable,
                    title: item.title,
                    updated_at: "",
                    weight: item.shipping_dimensions.weight,
                    weight_unit: null,
                }

                return variant;
            });
        }

        let tempObj = {
            collection_id: null,
            created_at: prod.external_created_at,
            discount_amount: prod.discount_amount,
            discount_type: prod.discount_type,
            handle: prod.handle,
            id: prod.id,
            images: prod.images,
            inventory_policy: null,
            shopify_details: {
                body_html: null,
                created_at: prod.external_created_at,
                handle: prod.handle,
                image: {},
                images: prod.images,
                options,
                product_type: prod.type,
                published_at: prod.published_at,
                shopify_id: prod.external_product_id,
                tags: null,
                title: prod.title,
                updated_at: prod.external_updated_at,
                variants,
                vendor: prod.vendor
            },
            shopify_product_id: prod.external_product_id,
            title: prod.title,
            updated_at: "2020-05-17T20:08:47"
        }

        if (prod.subscription_options && Object.keys(prod.subscription_options).length > 0) {
            const subscription_defaults = {
                charge_interval_frequency: prod.subscription_options.charge_interval_frequency,
                cutoff_day_of_month: prod.subscription_options.cutoff_day_of_month,
                cutoff_day_of_week: prod.subscription_options.cutoff_day_of_week,
                expire_after_specific_number_of_charges: prod.subscription_options.expire_after_specific_number_of_charges,
                modifiable_properties: prod.subscription_options.modifiable_properties,
                number_charges_until_expiration: prod.subscription_options.number_charges_until_expiration,
                order_day_of_month: prod.subscription_options.order_day_of_month,
                order_day_of_week: prod.subscription_options.order_day_of_week,
                order_interval_frequency_options,
                order_interval_unit: prod.subscription_options.order_interval_unit,
                storefront_purchase_options: prod.subscription_options.storefront_purchase_options
            }

            tempObj.subscription_defaults = subscription_defaults;
        }

        return tempObj;
    });
}
