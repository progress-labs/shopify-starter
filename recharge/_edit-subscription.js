/*============================
    CANCELLATION FLOW BEGIN
============================*/

function cancelSubscriptionFlow(event) {
    event.preventDefault();

    ReCharge.Novum.backBtn.setAttribute('style', 'visibility: hidden');
    const cancellationReasons = JSON.parse(sessionStorage.getItem('rc_retention_strategies'));
    const subscription = ReCharge.Novum.subscription;
    let store = {{ store | json }};

    ReCharge.Novum.sidebarHeading.innerHTML = ReCharge.Novum.subscription.product_title;
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_cancellation_reasons.html' %}`;
    let reasonsContainer = document.querySelector('#rc_cancellation_reasons_list');

    let filteredReasons = isPrepaid(subscription) || store.domain.includes('mybigcommerce.com')
        ? cancellationReasons.filter(reason => reason.incentive_type !== "swap_product")
        : cancellationReasons;

    if (subscription.order_day_of_month !== 0 && subscription.order_day_of_month !== null)  {
        filteredReasons = filteredReasons.filter(reason => reason.incentive_type !== "delay_subscription");
    }

    if (subscription.order_day_of_week !== 0 && subscription.order_day_of_week !== null)  {
        filteredReasons = filteredReasons.filter(reason => reason.incentive_type !== "delay_subscription");
    }

    reasonsContainer.innerHTML += `
        ${filteredReasons.map(reason => `
            <div class="rc_purchase_type border-light margin-top-10">
                <input
                    id="${reason.cancellation_reason}"
                    type="radio"
                    name="retention_strategy_id"
                    value="${reason.id}"
                >
                <label for="${reason.cancellation_reason}">
                    ${reason.cancellation_reason}
                </label>
            </div>`).join('')}
        <br>

        <button class="rc_btn text-uppercase title-bold rc_proceed-btn"> Proceed </button>
    `;

    // add event listener on proceed button
    document.querySelector('.rc_proceed-btn').addEventListener('click', renderRetentionStrategiesHandler);
    ReCharge.Novum.toggleSidebar();
}

function renderRetentionStrategiesHandler(event) {
    event.preventDefault();

    ReCharge.Novum.backBtn.setAttribute('style', 'visibility: visible');
    ReCharge.Novum.backBtn.removeEventListener('click', swapProductHandler, false);
    ReCharge.Novum.backBtn.removeEventListener('click', editProduct, false);
    ReCharge.Novum.backBtn.addEventListener('click', cancelSubscriptionFlow);

    const subscription = ReCharge.Novum.subscription;
    const { id, address_id, order_interval_unit, product_title } = subscription;
    const cancellationReasons = JSON.parse(sessionStorage.getItem('rc_retention_strategies'));
    const strategyId = document.querySelector('[name=retention_strategy_id]:checked').value;
    const retentionStrategy = cancellationReasons.find( reason => reason.id == strategyId);

    const { incentive_type, discount_code, prevention_text, cancellation_reason } = retentionStrategy;

    let output, btnText, btn, type, actionUrl;

    if(incentive_type == 'discount') {
        actionUrl = ReCharge.Endpoints.apply_discount_to_address_url(address_id);

        output = `<form method="post" action="${actionUrl}" id="apply-discount-form" onsubmit="applyDiscountHandler(event)" data-code="${discount_code}">`;
        btnText = `{{ 'Apply_discount' | t }}`;
    } else if(incentive_type == 'skip_charge') {
        actionUrl = ReCharge.Endpoints.skip_subscription_url(id);

        output = `<form method="post" action="${actionUrl}" id="ReChargeForm_strategy">
        <input type="hidden" name="subscription_id" value="${subscription.id}">`;
        btnText = `{{ 'Skip_next_charge' | t }}`;
    } else if(incentive_type == 'swap_product') {
        if(!isPrepaid(subscription)) {
        output = `<button class="rc_btn text-uppercase title-bold js-swap-product-btn" onclick="swapProductHandler(event)"> Swap product </button>`;
        } else {
        output = '';
        }
    } else if(incentive_type == 'delay_subscription') {
        actionUrl = ReCharge.Endpoints.delay_subscription_url(id);

        output = `
        <form method="post" action="${actionUrl}" id="ReChargeForm_strategy">
            <label for="delay_for">{{ 'Delay_for' | t }}</label>
            <select name="delay_for" id="delay_for">
                <option value="${order_interval_unit == 'day' ? 7 : 1}_${order_interval_unit}">
                    ${order_interval_unit == 'day' ? 7 : 1} ${order_interval_unit}
                </option>
                <option value="${order_interval_unit == 'day' ? 14 : 2}_${order_interval_unit}">
                    ${order_interval_unit == 'day' ? 14 : 2} ${order_interval_unit}
                </option>
                <option value="${order_interval_unit == 'day' ? 21 : 3}_${order_interval_unit}">
                    ${order_interval_unit == 'day' ? 21 : 3} ${order_interval_unit}
                </option>
            </select>
        `;
        btnText = `{{ 'Delay_subscription' | t }}`;
    } else {
        output = ``;
    }

    if(incentive_type == 'swap_product') {
        btn = ``;
    } else if (incentive_type) {
        btn = `
            <button type="submit" class="rc_btn text-uppercase title-bold">${btnText} </button>
        </form>
        `;
    } else {
        btn = `<textarea class="textarea-size" onchange="document.querySelector('[name=cancellation_reason_comments]').value=this.value"> </textarea><br>`;
    }

    actionUrl = ReCharge.Endpoints.cancel_subscription_url(id);

    ReCharge.Novum.sidebarContent.innerHTML = `
        <h4>${prevention_text != '' ? prevention_text : cancellation_reason}</h4>
        ${output}
        ${btn}
        <form method="post" id="cancel_ReChargeForm" onsubmit="bulkCancelAddonProducts(event, '${actionUrl}'); return false">
            <input type="hidden" name="cancellation_reason" value="${cancellation_reason}">
            <input type="hidden" name="cancellation_reason_comments" value="">
            <input type="hidden" name="redirect_url" value="{{ subscription_list_url }}">
        <button type="submit" id="cancel_subscription" class="rc_btn--secondary text-uppercase title-bold text-center margin-top-10">
            {{ 'Cancel_my_subscription' | t }}
        </button>
        </form>
    `;
}

async function applyDiscountHandler(event) {
    event.preventDefault();

    const subscriptionAddress = ReCharge.Novum.subscription.address;
    const discountCode = event.target.closest('#apply-discount-form').dataset.code;

    ReCharge.Forms.toggleSubmitButton(event.target.querySelector('button'));

    if(subscriptionAddress.discount_id != null) {
        try {
            const response = await axios({
                url: ReCharge.Endpoints.remove_discount_from_address_url(subscriptionAddress.id),
                method: 'post'
            });


            setTimeout(function() {
                ReCharge.Actions.put('apply_discount_to_address_url', subscriptionAddress.id, {discount_code: discountCode});
            }, 3000);

        } catch(error) {
            console.error(error);
            ReCharge.Toast.addToast('error', 'Create failed');
        } finally {
            delete window.locked;
        }
    } else {
        ReCharge.Actions.put('apply_discount_to_address_url', subscriptionAddress.id, {discount_code: discountCode});
    }
}

function deleteOnetime(event) {
    event.preventDefault();

    ReCharge.Novum.backBtn.setAttribute('style', 'visibility: hidden');
    const onetimeId = event.target.dataset.onetimeId;
    const isAddOn = event.target.dataset.addOn;
    let actionUrl = ReCharge.Endpoints.cancel_onetime_product(onetimeId);

    let text = isAddOn == "true" ? "Delete" : "Remove";

    ReCharge.Novum.sidebarHeading.innerHTML = text;
    ReCharge.Novum.sidebarContent.innerHTML = `
        <div> Are you sure you want to ${text.toLowerCase()} this product? </div>
        <form action="${actionUrl}" method="post" id="ReChargeForm_delete_onetime">
        <input type="hidden" name="redirect_url" value="{{ schedule_url }}">
        <br>
        <button type="submit" class="rc_btn text-uppercase title-bold">${text}</button>
        </form>
    `;

    ReCharge.Novum.toggleSidebar();
}

/*==========================
	CANCELLATION FLOW END
==========================*/

/*==================
	DISCOUNT BEGIN
==================*/

function addDiscountHandler(event) {
    event.preventDefault();
    const title = event.target.dataset.title;
    const addressId = event.target.dataset.id;
    let actionUrl = ReCharge.Endpoints.apply_discount_to_address_url(addressId);

    ReCharge.Novum.sidebarHeading.innerHTML = title;
    ReCharge.Novum.sidebarContent.innerHTML = `
        <form method="post" action="${actionUrl}" id="ReChargeForm_applyDiscount">
        <label for="discount_code" class="text-font-14">Discount code</label>
        <input type="text" name="discount_code" id="discount_code">
        <br>
        <button type="submit" class="rc_btn text-uppercase title-bold">Add discount</button>
        </form>
    `;

    ReCharge.Novum.toggleSidebar();
}

async function buildDiscountCard(discountId) {
    const discounts = JSON.parse(sessionStorage.getItem("rc_discounts")) || null;
	let discount = {};

    if (discounts === null) {
        discount = await fetchDiscount(discountId);
    } else {
        discount = discounts.find(disc => disc.id === discountId);
        if (!discount) {
          discount = await fetchDiscount(discountId);
        }
    }

    if (validateDiscountForSubscription(discount)) {
        populateDiscountCard(discount);
        showDiscountCard();
    }
}

function validateDiscountForSubscription(discount) {
    const subscription = ReCharge.Novum.subscription;

    const hasValidAppliesTo = validateAppliesTo(discount, subscription);
    const hasValidAppliesToProductType = validateAppliesToProductType(discount);

    return hasValidAppliesTo && hasValidAppliesToProductType;
}

function validateAppliesTo(discount, subscription) {
    switch (discount.applies_to) {
        case 'shopify_product':
            const productId = discount.applies_to_id;

            return subscription.product.shopify_product_id === productId;
        case 'shopify_collection_id':
            // No current way of defining if the subscription product is on the specified shopify collection.
            const rc_charges = JSON.parse(sessionStorage.getItem('rc_charges'));

            if(rc_charges[0]) {
                if(rc_charges[0].discount_codes.length) {
                    return true;
                }
            }
            return false;

        default:
            return true;
    }
}

function validateAppliesToProductType(discount) {
    const validProductTypes = ['ALL', 'SUBSCRIPTION'];

    return validProductTypes.includes(discount.applies_to_product_type);
}

async function fetchDiscount(discountId) {
    const schema = `{ "discounts": {"id": ${discountId} } }`;

    try {
        const response = await axios(`${ReCharge.Endpoints.request_objects()}&schema=${schema}`);

        if (Object.keys(response.data.discounts).length) {
            return response.data.discounts;
        }

    } catch (error) {
        console.error(error.response.data.error);
        return;
    }

    return;
}

function populateDiscountCard(discount) {
    const card = document.querySelector('.rc_discount_container');
    const discountValue = calculateDiscountValue(discount);

    card.querySelector('.rc_discount__code').textContent = discount.code;
    card.querySelector('.rc_discount__value').textContent = `-${getCurrency()}${Number(discountValue).toFixed(2)}`;
}

function calculateDiscountValue(discount) {
    const charge = JSON.parse(sessionStorage.getItem('rc_charges'))[0];
    let value = charge.discount_codes[0].amount;

    return value;
}

function showDiscountCard() {
    document.querySelector('.rc_discount_container').style.display = 'block';
}
/*================
	DISCOUNT END
================*/

/*============================
	EDIT SUBSCRIPTION BEGIN
============================*/

function editNextShipment(event) {
    event.preventDefault();

    const parent = event.target.closest(".rc_card_container");
    const subDate = parent.dataset.date;
    const status = event.target.dataset.status;
    const subscriptionId = ReCharge.Novum.subscription.id;
    const title = isPrepaid(ReCharge.Novum.subscription)
        ? "Next charge"
        : "Next shipment";

    let calendarDate = formatDate(new Date());

    if (subDate != "None") {
        calendarDate = subDate.split("T")[0];
    }

    let actionUrl = ReCharge.Endpoints.subscription_charge_date_url(subscriptionId);
    if (status === "ONETIME") {
        actionUrl = ReCharge.Endpoints.update_onetime(subscriptionId);
    }
    let redirect_url = ReCharge.Endpoints.update_subscription_url(subscriptionId);

    ReCharge.Novum.sidebarHeading.innerHTML = title;
    ReCharge.Novum.sidebarContent.innerHTML = `
        <form method="post" action="${actionUrl}" id="ReChargeForm_date">
            <input type="hidden" name="redirect_url" value="${redirect_url}">
            {% include '_vanilla_calendar.html' %}
            <br>
            <button
                type="button"
                class="rc_btn text-uppercase title-bold"
                onclick="updateNextChargeDateHandler(event, '${actionUrl}', '${subscriptionId}')"
            >
                Update next shipment date
            </button>
            ${
                !ReCharge.Novum.settings.has_shopify_connector 
                    ?  `<button
                          type="button"
                          class="rc_btn--secondary text-uppercase title-bold text-center"
                          onclick="shipNowHandler(event, '${subscriptionId}', '${subDate}')"> Order now 
                        </button>` 
                    :   ""
            }
        </form>
    `;

    initCalendar(calendarDate);

    if (status === "ONETIME") {
        document
            .querySelector("#next_charge_date")
            .setAttribute("name", "next_charge_scheduled_at");
    }

    ReCharge.Novum.toggleSidebar();
}

function updateNextChargeDateHandler(event, actionUrl, id) {
    event.preventDefault();

    const charge = JSON.parse(sessionStorage.getItem("rc_charges"))[0];
    const onetimes = JSON.parse(sessionStorage.getItem("rc_onetimes")) || null;
    // Get element with the new date value
    const newDateEl = document.querySelector("#next_charge_date");
    const dataToSend = {
        [newDateEl.name]: newDateEl.value
    }

    if (charge && charge.line_items.length > 1 && onetimes != null && onetimes.length &&
        ReCharge.Novum.subscription.status == "ACTIVE") {
        let subOnetimes;
        subOnetimes = onetimes.filter( otp => otp.next_charge_scheduled_at == charge.scheduled_at && otp.address_id == charge.address_id);

        if (subOnetimes.length) {
        ReCharge.Novum.sidebarHeading.innerHTML = "Next order";
        ReCharge.Novum.sidebarContent.innerHTML = `
            <div class="margin-bottom-20">
                There ${subOnetimes.length > 1 ? `are ${subOnetimes.length}` : `is ${subOnetimes.length}` } product ${subOnetimes.length > 1 ? 's' : ''} associated with this order.
                Would you like to adjust the order date for all products or just this product?
            </div>
            <div>
                ${renderSubOnetimes([ReCharge.Novum.subscription])}
            </div>

            <div class="subscription-order-divider"> </div>

            <div class="margin-top-10">
                ${renderSubOnetimes(subOnetimes)}
            </div>

            <div>
                <button
                    class="rc_btn text-uppercase title-bold ship-now-btn"
                    onclick="bulkUpdateOnetimes(event, '${newDateEl.name}', '${newDateEl.value}', '${actionUrl}')"
                >
                    Update for all products
                </button>
            </div>
            <div>
                <button
                    class="rc_btn text-uppercase title-bold ship-now-btn"
                    onclick="triggerSingleProductUpdate(event, '${actionUrl}', '${newDateEl.name}', '${newDateEl.value}')"
                >
                    Update for this product only
                </button>
            </div>
        `;
        } else {
            ReCharge.Forms.toggleSubmitButton(event.target);
            ReCharge.Actions.put('update_next_charge_date', actionUrl, dataToSend);
        }
    } else {
        ReCharge.Forms.toggleSubmitButton(event.target);
        ReCharge.Actions.put('update_next_charge_date', actionUrl, dataToSend);
    }
}

function editScheduleHandler(event) {
    event.preventDefault();

    const subscription = ReCharge.Novum.subscription;
    let settings = {{ settings | json }};
    let deliveryOutput;
    const { edit_order_frequency } = settings.customer_portal.subscription;
    const { id, order_interval_unit, charge_interval_frequency, order_interval_frequency } = subscription;


    if(edit_order_frequency === 'Any') {

        deliveryOutput = `
        <input type="hidden" name="charge_interval_frequency" class="delivery_frequency" value="${charge_interval_frequency}">
        <input type="hidden" name="order_interval_unit" value="${order_interval_unit}">

        <div>
            <select name="order_interval_frequency" onchange="document.querySelector('[name=charge_interval_frequency]').value=this.value" required>
                ${renderOrderFrequencyOptions(order_interval_unit, order_interval_frequency)}
            </select>
        </div>
        <div class="rc_purchase_type border-light margin-top-10">
            <input id="day" type="radio" name="unit_option" class="unit_option" value="day" ${ order_interval_unit == 'day' ? 'checked' : ''}>
            <label for="day">Days </label>
        </div>
        <div class="rc_purchase_type border-light margin-top-10">
            <input id="week" type="radio" name="unit_option" class="unit_option" value="week" ${order_interval_unit == 'week' ? 'checked' : ''}> <label for="week">Weeks </label>
        </div>
        <div class="rc_purchase_type border-light margin-top-10">
            <input id="month" type="radio" name="unit_option" class="unit_option" value="month" ${order_interval_unit == 'month' ? 'checked' : ''}> <label for="month">Months </label>
        </div>
        `;
    } else if(edit_order_frequency === 'Limited') {
        deliveryOutput = subscription.product.subscription_defaults.order_interval_frequency_options.map(freq => `
        <div class="rc_purchase_type border-light">
            <input
                id="${freq}"
                type="radio"
                name="delivery_option"
                value="${freq}"
                ${freq == order_interval_frequency ? 'checked' : ''}
                onclick="document.querySelectorAll('.delivery_frequency').forEach(freq => freq.value=this.value)"
            >
            <label for="${freq}">
                ${freq}
                ${freq > 1
                        ? subscription.product.subscription_defaults.order_interval_unit.toLowerCase()
                        : subscription.product.subscription_defaults.order_interval_unit.toLowerCase().slice(0, -1)
                }
            </label>
        </div>
        <br>
        `).join('');

        deliveryOutput += `
        <input type="hidden" name="order_interval_frequency" class="delivery_frequency" value="${charge_interval_frequency}">
        <input type="hidden" name="charge_interval_frequency" class="delivery_frequency" value="${order_interval_frequency}">
        <input type="hidden" name="order_interval_unit" value="${subscription.product.subscription_defaults.order_interval_unit}">
        `;
    } else if(edit_order_frequency === 'Prohibited') {
        deliveryOutput = `
        <input type="hidden" name="charge_interval_frequency" value="${charge_interval_frequency}">
        <input type="hidden" name="order_interval_unit" value="${order_interval_unit}">
        <input type="hidden" name="order_interval_frequency" value="${order_interval_frequency}">
        <div>
            ${charge_interval_frequency}
            ${charge_interval_frequency > 1
                ? order_interval_unit.concat('s')
                : order_interval_unit
            }
        </div>
        `;
    }

    let actionUrl = ReCharge.Endpoints.update_subscription_url(id);

    ReCharge.Novum.sidebarHeading.innerHTML = 'Deliver every';
    ReCharge.Novum.sidebarContent.innerHTML = `
        ${charge_interval_frequency != order_interval_frequency
            ? `This is a prepaid subscription, so the frequency can't be changed. For more information, please email the store at <b><i>{{ settings.customer_portal.subscription.cancellation_email_contact }}</i></b>`
            : `
            <form method="post" action="${actionUrl}" id="ReChargeForm_schedule">
                ${deliveryOutput}
                <button type="submit" class="rc_btn text-uppercase title-bold margin-top-10"> Update </button>
            </form>`
        }
    `;

    const unitOptions = document.querySelectorAll('.unit_option');
    if(unitOptions != null) {
        unitOptions.forEach(unit => unit.addEventListener('click', e => {
            document.querySelector('[name=order_interval_unit]').value = e.target.value;
            let selectEl = document.querySelector('[name=order_interval_frequency]');
            selectEl.innerHTML = renderOrderFrequencyOptions(e.target.value, selectEl.value)
        }));
    }

    ReCharge.Novum.toggleSidebar();
}

function shipNowHandler(event, subscriptionId, subDate, openModal = false) {
    event.preventDefault();

    ReCharge.Novum.sidebarHeading.innerHTML = 'Order now';
    ReCharge.Novum.sidebarContent.innerHTML = `
        <div id="ship__now--container">

        </div>
    `;

    renderLineItems(subscriptionId, subDate);

    document.querySelectorAll('.ship-now-btn').forEach(btn => btn.addEventListener('click', chargeProcessHandler));

    if (openModal || openModal == 'true') {
        ReCharge.Novum.toggleSidebar();
    }
}

function chargeProcessHandler(evt) {
    evt.preventDefault();

    const subscriptionId = evt.target.dataset.subscriptionId;
    let type = evt.target.dataset.type;
    let chargeId = document.querySelector('.charge-id').dataset.chargeId;
    let url;

    const data = {};
    const shipDate = formatDate(new Date());
    data.charge_id = chargeId;

    if(type === 'one') {
        if(ReCharge.Novum.subscription.status === "ONETIME") {
            data.next_charge_scheduled_at = shipDate;
            url = `update_onetime`;
        } else {
            data.date = shipDate;
            url = `subscription_charge_date_url`;
        }
        chargeId = subscriptionId;
    } else {
        url = `process_charge`;
    }

    ReCharge.Forms.toggleSubmitButton(evt.target);

    ReCharge.Actions.put(url, chargeId, data);
}

function unskipShipmentHandler(event) {
    event.preventDefault();

    const subscriptionId = event.target.dataset.id;
    const title = 'Unskip';
    const chargeId = event.target.dataset.chargeId;
    const newDate = new Date(event.target.dataset.chargeDate);
    const month = newDate.toLocaleString('default', { month: 'long' });

    let actionUrl = ReCharge.Endpoints.unskip_subscription_url(subscriptionId);

    ReCharge.Novum.sidebarHeading.innerHTML = title;
    ReCharge.Novum.sidebarContent.innerHTML = `
        <form id="ReChargeForm_unskip">
            <div>
                Your shipment on
                <span class="color-light-green text-center title-bold">
                    ${month} ${newDate.getDate()}
                </span>
                will be unskipped.
            </div>
            <br>
            <button
                type="button"
                class="rc_btn text-uppercase title-bold"
                onclick="sendRequest(event, '${actionUrl}', ${chargeId ? chargeId : null})"
                data-type="unskip"
            >
                unskip
            </button>
        </form>
    `;

    ReCharge.Novum.toggleSidebar();
}

function skipShipmentHandler(event) {
    event.preventDefault();

    const subscriptionId = event.target.dataset.id;
    const chargeId = event.target.dataset.chargeId;
    const dateValue = event.target.dataset.date;
    const unit = event.target.dataset.unit;
    const isFutureCharge = event.target.hasAttribute('data-future-charge');
    const frequency = Number(event.target.dataset.frequency);
    const addressId = event.target.dataset.addressId;
    const title = 'Skip next shipment';

    let currentDate = event.target.dataset.currentDate;
    let shipmentDate = new Date(dateValue);
    let newDate = new Date(dateValue);
    let actionUrl = ReCharge.Endpoints.skip_subscription_url(subscriptionId);

    if (unit === 'day') {
        newDate.setDate(newDate.getDate() + frequency);
    } else if (unit === 'week') {
        const newUnit = frequency * 7
        newDate.setDate(newDate.getDate() + newUnit);
    } else {
        newDate.setMonth(newDate.getMonth() + frequency);
    }

    let month = newDate.toLocaleString('default', { month: 'long' });
    let day = getNumberSuffix(shipmentDate.getDate());
    let formattedDate = formatDate(shipmentDate);

    ReCharge.Novum.sidebarHeading.innerHTML = title;
    ReCharge.Novum.sidebarContent.innerHTML = `
        <form id="subscriptionSkipForm">
            ${renderSingleSkipLayout(currentDate, day, month, newDate, formattedDate, actionUrl, chargeId, isFutureCharge)}
        </form>

        <button
            class="js-dont-skip rc_btn--secondary rc_btn--secondary--color text-uppercase title-bold text-center"
            onclick="ReCharge.Novum.toggleSidebar()"
        >
            No, do not skip
        </button>
    `;

    let container = document.querySelector('#subscriptionSkipForm');
    let submitBtn = container.querySelector('[type="button"]');
    let dontSkipBtn = document.querySelector('.js-dont-skip');

    const otps = ReCharge.Novum.onetimes || JSON.parse(sessionStorage.getItem("rc_onetimes"));

    let typeUrl, msg;
    // check if there are otps and if they are tied to the subscription (have the same address_id and next_charge_scheduled_at)
    if (otps && otps.length) {
        const subOtps = otps.filter(otp => otp.next_charge_scheduled_at == dateValue && otp.address_id == addressId);

        // there are otps tied to a subscription
        if (subOtps.length) {
            ReCharge.Novum.bulk_onetimes = subOtps;
            container = `${renderSingleSkipLayout(currentDate, day, month, newDate, formattedDate, actionUrl, chargeId, isFutureCharge)} `;
            if (chargeId || !isFutureCharge) {
                typeUrl = 'onetime_charge_date_url';
                msg = `
                    <br>
                    <span>
                        This subscription also has
                        <span class="title-bold">
                            ${subOtps.length} one-time/add-on product${subOtps.length > 1 ? '(s)' : ''}
                        </span>
                        associated with it. It will now be delivered with your next upcoming shipment.
                    </span>
                `;
            } else if (isFutureCharge) {
                typeUrl = 'cancel_onetime_product';
                msg = `
                    <br>
                    <span>
                        This subscription also has
                        <span class="title-bold">
                            ${subOtps.length} one-time/add-on product${subOtps.length > 1 ? 's' : ''}
                        </span>
                        associated with it. It will be
                        <span class="title-bold">
                            cancelled
                        </span>
                        for this date. You will need to re-add it.
                    </span>
                `;
            }

            document.querySelector('.js-otp-info').innerHTML = msg;
            submitBtn.textContent = 'Yes, proceed';
            submitBtn.addEventListener('click', (e) => sendRequest(e, actionUrl, chargeId ? chargeId : formattedDate, formattedDate, newDate, true, typeUrl));
        // there are otps, but are not tied to a subscription
        } else {
            container = renderSingleSkipLayout(currentDate, day, month, newDate, formattedDate, actionUrl, chargeId, isFutureCharge);
            submitBtn.addEventListener('click', (e) => sendRequest(e, actionUrl, chargeId ? chargeId : null, formattedDate, newDate));
            if (!window.location.href.includes('schedule')) {
                dontSkipBtn.style.display = 'none';
            }
        }
    }
    // this is for skip on edit subscription page
    else {
        submitBtn.addEventListener('click', (e) => sendRequest(e, actionUrl, chargeId ? chargeId : null, formattedDate, newDate));
        dontSkipBtn.style.display = 'none';
    }

    ReCharge.Novum.toggleSidebar();
}

function renderSingleSkipLayout(currentDate, day, month, newDate, formattedDate, actionUrl, chargeId, isFutureCharge) {
    return `
        <div class="js-otp-info"> </div>
        <br>
        <div>
            Your upcoming shipment on ${currentDate}${day} will be skipped. Your next shipment will be on:
        </div>
        <br>
        <h3 class="color-light-green text-center">
            ${month} ${newDate.getDate()}
        </h3>
        <button
            type="button"
            class="rc_btn text-uppercase title-bold"
            data-type="${ isFutureCharge ? 'skip-future' : 'skip'}"
        >
            skip
        </button>

    `;
}

/*
  This is for Skip/Unskip functionality
*/
async function sendRequest(event, url, chargeId, date, newDate, bulkOtp=false, bulkUrl='onetime_charge_date_url') {
    event.preventDefault();
    window.locked = true;

    ReCharge.Forms.toggleSubmitButton(event.target);
    const type = event.target.dataset.type;
    const action =  type === 'unskip' ? 'unskip' : 'skip';
    const data = getDataByType(type, chargeId, date);

    try {
        const response = await axios({
            url: url,
            method: "post",
            data: data,
        });

        if (bulkOtp) {
            let formattedDate = formatDate(newDate);
            syncUpload.upload(ReCharge.Novum.bulk_onetimes, { next_charge_scheduled_at: formattedDate }, bulkUrl);
        } else {
            ReCharge.Toast.addToast("success", `Order ${action}ped successfully.`);
            window.location.reload();
        }
    } catch (error) {
        console.error(error);
        ReCharge.Toast.addToast("error", `Unable to ${action} this order.`);
        ReCharge.Forms.toggleSubmitButton(event.target);
    } finally {
        delete window.locked;
    }
}

function getDataByType(type, chargeId, date) {
    const data = {};

    if (type === "skip-future") {
        data["date"] = date;
    } else if (type === "unskip" && chargeId) {
        data["charge_id"] = chargeId;
    }

    return data;
}

function editProduct(event) {
    event.preventDefault();

    ReCharge.Novum.backBtn.setAttribute('style', 'visibility: hidden');

    let subscription = ReCharge.Novum.subscription;
    const { id, product, price, quantity, status } = subscription;
    const { change_product, change_variant } = {{ settings | json }}.customer_portal.subscription;
    let shopify_variant_id = '';

    ReCharge.Novum.store.external_platform === 'shopify'
        ? shopify_variant_id = subscription.shopify_variant_id
        : shopify_variant_id = subscription.external_variant_id
    ;

    let variantOutput = product.shopify_details.variants
        .map(
            variant => `
                <div class="rc_purchase_type border-light margin-top-10">
                    <input id="${
                        variant.shopify_id
                    }" type="radio" name="variant_radio_option" value="${
                        variant.shopify_id
                    }" data-price="${variant.price}" ${
                        shopify_variant_id === variant.shopify_id
                            ? "checked"
                            : ""
                    }>
                    <label for="${variant.shopify_id}">${variant.title}</label>
                </div>
            `
        )
        .join("");

    if (status === "ONETIME") {
        actionUrl = ReCharge.Endpoints.update_onetime(id);
    } else {
        actionUrl = ReCharge.Endpoints.update_subscription_url(id);
    }

    ReCharge.Novum.sidebarHeading.innerHTML = 'Edit product';
    ReCharge.Novum.sidebarContent.innerHTML = `
        <form
            method="post"
            action="${actionUrl}"
            id="updateVariantForm"
        >
            ${ReCharge.Novum.store.external_platform === 'shopify'
                ? `<input type="hidden" name="shopify_variant_id" value="${subscription.shopify_variant_id}">`
                : `<input type="hidden" name="external_variant_id" value="${subscription.external_variant_id}">`
            }
            <input type="hidden" name="id" value="${subscription.id}">
            ${renderSubscriptionProductInfo(
                product,
                price,
                quantity,
                shopify_variant_id
            )}
            ${
                change_variant &&
                product.shopify_details.variants.length > 1
                    ? `<label class="text-font-14"> Variants </label>
                       ${variantOutput}`
                    : ``
            }
            <br>
            <button type="submit" class="rc_btn text-uppercse title-bold"> Update </button>
        </form>
        ${
            status === "ACTIVE" &&
            change_product &&
            !isPrepaid(subscription)
                ?   `<a
                        href=""
                        class="rc_btn--secondary text-uppercase title-bold text-center rc_btn--secondary--color js-swap-product-btn"
                        onclick="swapProductHandler(event, 'product-edit')">{{ 'title_swap_product' | t }}
                    </a>`
                : ""
        }
    `;

    // add handler for updating form
    document.querySelector('#updateVariantForm').addEventListener('submit', updateProduct);

    // show correct variant price on initial load
    let variantPriceEl = document.querySelector('#variant-price');
    const variantPrice = `${getCurrency()}${(Number(variantPriceEl.dataset.price) * quantity).toFixed(2)}`;
    variantPriceEl.innerText = variantPrice;

    /* Add on click event that will update the value of shopify_variant_id */
    document.querySelectorAll("[name=variant_radio_option]").forEach((radio) => {
        radio.addEventListener("click", (event) => {
            // Get variant price
            let price = event.target.dataset.price;
            // Get current quantity
            let quantity = document.querySelector("[name=quantity]").value;

            updatePrice(subscription.product, 'subscription', price, quantity);

            // Update selected variant
            document.querySelector("[name=shopify_variant_id]").value =
                event.target.value;

            // Change product image when variant changes
            let variantImage = getImageUrl(subscription.product, event.target.value);
            document.querySelector(".variant-image").setAttribute("src", variantImage);
        });
    });

    ReCharge.Novum.toggleSidebar();
}

async function updateProduct(evt) {
    ReCharge.Actions.sendRequest(evt);
}

function swapProductHandler(event, source = "cancellation-flow") {
    event.preventDefault();

    ReCharge.Novum.backBtn.setAttribute("style", "visibility: visible");
    // remove event where backBtn would lead to swap search that was placed in function swapProductDetailsHandler
    ReCharge.Novum.backBtn.removeEventListener("click", swapProductHandler, false);
    ReCharge.Novum.backBtn.removeEventListener("click", cancelSubscriptionFlow, false);

    // add event where backBtn points to edit product
    if (source === "cancellation-flow") {
        ReCharge.Novum.backBtn.addEventListener("click", cancelSubscriptionFlow);
    } else {
        ReCharge.Novum.backBtn.addEventListener("click", editProduct);
    }

    ReCharge.Novum.sidebarHeading.innerHTML = "Select product";
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_render_products.html' %}`;
    let products = JSON.parse(sessionStorage.getItem("rc_products"));

    let firstPageProducts = [...products].filter(prod =>
        prod.subscription_defaults &&
        prod.subscription_defaults.charge_interval_frequency == prod.subscription_defaults.order_interval_frequency_options[0]
    );

    renderProducts(firstPageProducts.slice(0, 6), "swap");

    const input = document.getElementById("rc_search");
    input.setAttribute("placeholder", "Search for a product to swap");
    input.addEventListener("keyup", (evt) => searchProductsHandler(evt, 'swap'));
}

function swapProductDetailsHandler(event) {
    event.preventDefault();

    ReCharge.Novum.backBtn.addEventListener("click", swapProductHandler);

    const subscription = ReCharge.Novum.subscription;
    let products = JSON.parse(sessionStorage.getItem("rc_products"));
    const productId = event.target.dataset.productId;

    const productToSwap = products.find(
        product => product.shopify_details.shopify_id == productId
    );
    const { shopify_id } = productToSwap.shopify_details.variants[0];

    ReCharge.Novum.sidebarHeading.innerHTML = "{{ 'title_swap_product' | t }}";
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_swap_product_details.html' %}`;

    const productContainer = document.querySelector(
        ".rc_swap_product_details_container"
    );

    let actionUrl = ReCharge.Endpoints.swap_subscription_url(subscription.id);
    productContainer.setAttribute("action", actionUrl);

    let redirect_url = ReCharge.Endpoints.update_subscription_url(subscription.id);

    productContainer.innerHTML = `
        <input type="hidden" name="redirect_url" value="${redirect_url}">
        ${
            ReCharge.Novum.store.external_platform === 'big_commerce'
                ? `<input type="hidden" name="external_product_id" value="${productToSwap.shopify_product_id}">`
                : ``
        }
        <input type="hidden" name="shopify_variant_id" value="${shopify_id}">
        <input type="hidden" name="address_id" value="${subscription.address_id}">
        <input type="hidden" name="next_charge_scheduled_at" value="${subscription.next_charge_scheduled_at}">

        ${renderSubscriptionProductInfo(productToSwap, getDisplayPrice(productToSwap))}
        ${renderDeliveryOptions(productToSwap)}
        <div id="product_variant_container">
            <h4>Variants</h4>
            <ul id="product_options_container"></ul>
        </div>
        <button
            type="submit"
            class="rc_btn text-uppercase title-bold"
        >
            {{ 'button_swap_product' | t }}
        </button>
    `;

    renderVariants(productToSwap);

    // Trigger the variant change callback to ensure correct price display
    triggerVariantUpdate();

    // Add handler for subscription/otp creation
   document.querySelector('#subscriptionSwapForm').addEventListener('submit', (e) => createProduct(e, productToSwap.shopify_details.shopify_id, 'swap'));
}