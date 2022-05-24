var ReCharge = {};
ReCharge.Novum = {};

ReCharge.Utils = {
    getParamValue: function(param) {
        var value = new RegExp("[?&]" + param + "=([^&#]*)", "i").exec(window.location.href);
        return value ? value[1] : null;
    },
    checkIfStoreAllowsCancellation(orders, cancelBtn) {
        const { cancel_subscription, cancellation_minimum_order_count } = {{ settings | json }}.customer_portal.subscription;
        const subscription = ReCharge.Novum.subscription || null;

        if (cancel_subscription) {
            let ordersCounter = 0;
            if (subscription !== undefined && orders.length) {
                orders.map(order => {
                    order.line_items.map(item => {
                        if (item.subscription_id === subscription.id) {
                            ordersCounter++;
                        }
                    });
                });
            }

            if (
                cancellation_minimum_order_count === 0 ||
                ordersCounter >= cancellation_minimum_order_count
                ) {
                    if (cancelBtn != null) {
                        cancelBtn.addEventListener("click", cancelSubscriptionFlow);
                    }
            } else {
                if (cancelBtn != null) {
                    ReCharge.Utils.contactStoreWording(
                        cancelBtn,
                        ReCharge.Utils.renderCancelSubscriptionLayout(),
                        "Cancel"
                    );
                }
            }
        } else {
            if (cancelBtn != null) {
                ReCharge.Utils.contactStoreWording(
                    cancelBtn,
                    ReCharge.Utils.renderCancelSubscriptionLayout(),
                    "Cancel"
                );
            }
        }
    },
    contactStoreWording: function(element, message, title) {
        element.addEventListener('click', () => {
            ReCharge.Novum.sidebarHeading.innerHTML = title;
            ReCharge.Novum.sidebarContent.innerHTML = `<div class="text-center"><br>${message}</div>`;
            ReCharge.Novum.toggleSidebar();
        });
    },
    renderContactStoreLayout: function(message) {
        return `
            <p class="text-center">
                Please contact us at
                <span class="address-info-msg title-bold">
                    {{ settings.customer_portal.subscription.cancellation_email_contact }}
                </span> to update ${message}.
            </p>
        `;
    },
    renderCancelSubscriptionLayout: function() {
        return `
            <span class="title-bold">
                We are sorry to see you go!
            </span>
            To cancel your subscription, please email us at
            <span class="address-info-msg title-bold">
                {{ settings.customer_portal.subscription.cancellation_email_contact }}
            </span>
            so we can process your cancellation to guarantee you'll no longer be charged for this subscription.
        `;
    },
    renderNoProductsLayout: function() {
        return `
            <h2> Toss these in... </h2>
            <div>Add a new product to your next package only or add a subscription! </div>
            <div class="text-center margin-top-10" id="upsells--loader"> No products to show.</div>
        `;
    }
};

ReCharge.Toast = {
    addToastListener: function(toaster) {
        toaster.addEventListener('animationend', function(e) {
            if (e.animationName === 'hide') {
                return toaster.removeChild(e.target);
            }
        });
    },
    buildToaster: function() {
        var toaster = document.createElement('ul');
        toaster.className = 'rc_toaster';
        ReCharge.Toast.addToastListener(toaster);

        return toaster;
    },
    buildToast: function(type, message) {
        type = typeof(type) === 'undefined' ? 'error' : type;
        message = typeof(message) === 'undefined' ? 'Message failed' : message;

        // Build elements
        var notice = document.createElement('li'),
            category = document.createElement('span'),
            content = document.createElement('p');

        // Add content
        //category.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
        content.innerHTML = message;

        // Assemble notice
        notice.className = 'rc_toast rc_toast--' + type;
        //notice.appendChild(category).className = 'rc_toast__type';
        notice.appendChild(content).className = 'rc_toast__message';

        return notice;
    },
    addToast: function(type, message) {
        var notice = ReCharge.Toast.buildToast(type, message);
        try {
            document.querySelector('.rc_toaster').appendChild(notice);
        } catch (e) {
            document.querySelector('body')
                .appendChild(ReCharge.Toast.buildToaster())
                .appendChild(notice);
        }
    }
};

ReCharge.Helpers = {
    toggle: function(id) {
        var element = document.getElementById(id);
        element.style.display = element.style.display === 'none' ? '' : 'none';
        return false;
    }
}

ReCharge.Forms = {
    prettyError: message => {
        message = message.split('_').join(' ');
        return message.charAt(0).toUpperCase() + message.slice(1);
    },
    printError: (form, input, error) => {
        const elementSelector = input == 'general' ? 'button[type="submit"]' : `input[name="${input}"]`;
        const inputElem = form.querySelector(elementSelector);
        const errorMessage = document.createElement('p');

        errorMessage.className = 'error-message';
        errorMessage.innerText = ReCharge.Forms.prettyError(error);

        try {
            inputElem.className = inputElem.className += ' error';
            inputElem.parentNode.insertBefore(errorMessage, inputElem.nextSibling);
        } catch (e) {
            console.warn(form, input, error, e);
            ReCharge.Toast.addToast('warning', ReCharge.Forms.prettyError(error));
        }
    },
    printAllErrors: (form, errors) => {
        Object.keys(errors).forEach(input => {
            const input_errors = Array.isArray(errors[input]) ? errors[input] : [errors[input]];
            input_errors.forEach(error => {
                ReCharge.Forms.printError(form, input, error);
            });
        });
    },
    updatePropertyElements: (name, value) => {
        document.querySelectorAll(`[data-property="${name}"]`).forEach(elem => elem.innerText = value);
    },
    updateAllProperties: elements => {
        Object.keys(elements).forEach(key => {
            const elem = elements[key];
            ReCharge.Forms.updatePropertyElements(elem.name, elem.value);
        });
    },
    resetErrors: () => {
        document.querySelectorAll('input.error').forEach(elem => {
            elem.className = elem.className.replace('error', '');
        });
        document.querySelectorAll('p.error-message').forEach(elem => {
            elem.parentNode.removeChild(elem);
        });
    },
    buildCountries: function(type = 'shipping') {
        let countries = JSON.parse(sessionStorage.getItem('rc_shipping_countries'));

        if (type === 'billing') {
            countries = JSON.parse(sessionStorage.getItem('rc_billing_countries'));
        }

        if ( !countries.length || !document.querySelector('#country')) { return; }
        var activeCountry = document.querySelector('#country').getAttribute('data-value'),
            options = '<option value="">Please select a country...</option>';
        options += countries.map(function(country) {
            var selected = (country.name === activeCountry) ? ' selected' : '';
            return '<option value="' + country.name + '"' + selected + '>' + country.name + '</option>';
        }).join('\n');
        document.querySelector('#country').innerHTML = options;
    },
    showProvinceDropdown: function() {
        if (!document.querySelector('#province') || !document.querySelector('#province_selector')) { return; }
        document.querySelector('#province').setAttribute('style', 'display: none;');
        document.querySelector('#province_selector').setAttribute('style', 'display: inline-block;');
    },
    hideProvinceDropdown: function() {
        if (!document.querySelector('#province') || !document.querySelector('#province_selector')) { return; }
        document.querySelector('#province').setAttribute('style', 'display: inline-block;');
        document.querySelector('#province_selector').setAttribute('style', 'display: none;');
    },
    updateProvinceInput: function(elem) {
        if (!document.querySelector('#province')) { return; }
        document.querySelector('#province').value = elem.value;
    },
    updateProvinces: function(elem) {
        const countries = JSON.parse(sessionStorage.getItem('rc_billing_countries'));

        if (!countries.length || !document.querySelector('#province')) { return; }
        const country = countries.find(function(country) {
            return country.name === elem.value;
        });
        if (!country || !country.provinces.length) {
            window.ReCharge.Forms.hideProvinceDropdown();
            return;
        }
        var provinces = country.provinces,
            activeProvince = document.querySelector('#province').value,
            options = '<option value="">Select province...</option>';
        options +=  provinces.map(function(province) {
            var selected = (province.name === activeProvince) ? ' selected' : '';
            return '<option value="' + province.name + '"' + selected + '>' + province.name + '</option>';
        }).join('\n');
        document.querySelector('#province_selector').innerHTML = options;
        ReCharge.Forms.showProvinceDropdown();
    },
    toggleSubmitButton: function(elem) {
        elem.disabled = !elem.disabled;
        let newText = elem.getAttribute('data-text') || 'Processing... ';
        if (elem.disabled) {
            elem.innerHTML = `<div class="title-bold" style="display: flex; justify-content: center; align-items: center;">${newText} <img src="https://rechargeassets-bootstrapheroes-rechargeapps.netdna-ssl.com/static/images/spinner-anim-3.gif?t=1589649332" style="width: 30px; height: 12px;" class="margin-left-10"></div>`;
        } else {
            elem.innerHTML = newText;
        }
    },
    decodeResponse: function(response) {
        if (typeof(response) === 'string') {
            return response;
        }

        return response['error'] || response['errors'];
    },
    populateAddressData: function(address) {
        const requiredAddressData =  [ "first_name", "last_name", "address1", "address2", "company", "city", "zip", "phone", "province"];

        for (const prop in address) {
            requiredAddressData.includes(prop) ? document.querySelector(`#${prop}`).value = address[prop] : '';
        }

        document.querySelector("#country")
                .setAttribute("data-value", address.country);
    }
};

ReCharge.Endpoints = {
    base: "{{ shopify_proxy_url if proxy_redirect else '' }}/portal/{{ customer.hash }}/",
    request_objects: function() {
        return attachQueryParams(`${this.base}request_objects`);
    },
    // Addresses endpoints
    list_addresses_url: function() {
        return attachQueryParams(`${this.base}addresses`);
    },
    create_address_url: function() {
        return attachQueryParams(`${this.base}addresses/new`);
    },
    show_address_url: function(id) {
        return attachQueryParams(`${this.base}addresses/${id}`);
    },
    // Subscriptions endpoints
    list_subscriptions_url: function() {
        return attachQueryParams(`${this.base}subscriptions`);
    },
    create_subscription_url: function() {
        return attachQueryParams(`${this.base}subscriptions/new`);
    },
    show_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}`);
    },
    update_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}`);
    },
    // Subscription action endpoints
    activate_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/activate`);
    },
    skip_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/skip`);
    },
    unskip_subscription_url: function (id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/unskip`);
    },
    swap_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/swap`);
    },
    subscription_charge_date_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/set_next_charge_date`);
    },
    delay_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/delay`);
    },
    // Subscription cancel endpoints
    cancel_subscription_url: function(id) {
        return attachQueryParams(`${this.base}subscriptions/${id}/cancel`);
    },
    retention_strategy_url: function(data) {
        return attachQueryParams(`${this.base}subscriptions/${data['id']}/cancel/${data['strategy']}`);
    },
    // Discount endpoints
    apply_discount_to_address_url: function(id) {
        return attachQueryParams(`${this.base}addresses/${id}/apply_discount`);
    },
    remove_discount_from_address_url: function(id) {
        return attachQueryParams(`${this.base}addresses/${id}/remove_discount`);
    },
    // One-time endpoints
    cancel_onetime_product: function(id) {
        return attachQueryParams(`${this.base}onetimes/${id}/cancel`);
    },
  	// process charge
  	process_charge: function(id) {
        return attachQueryParams(`${this.base}charges/${id}/process`);
    },
    create_onetime: function() {
        return attachQueryParams(`${this.base}onetimes`);
    },
    update_onetime: function(id) {
        return attachQueryParams(`${this.base}onetimes/${id}`);
    },
    update_next_charge_date: function(url) {
        return attachQueryParams(url);
    },
    onetime_charge_date_url: function(id) {
        return attachQueryParams(`${this.base}onetimes/${id}/set_next_charge_date`);
    },
    update_billing_address: function() {
        return attachQueryParams(`${this.base}payment_source/1/address`);
    },
    send_shopify_connector_email: function() {
        return attachQueryParams(`${this.base}notifications`);
    }
};

ReCharge.Actions = {
    get: async function(endpoint, id, schema) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined' || typeof(id) === 'undefined' || typeof(schema) === 'undefined') {
            return false;
        }

        let url = ReCharge.Endpoints[endpoint](id);
        console.log('get', url);

        const dataUrl = attachQueryParams(`${ReCharge.Endpoints.request_objects()}&schema=${schema}`);

        try {
            const response = await axios(dataUrl);
            console.log(response.data);
        } catch(error) {
            console.error(error);
        } finally {
            delete window.locked;
        }
    },
    post: async function(endpoint, data) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined') { return false; }

        var url = ReCharge.Endpoints[endpoint](data);
        console.log('post', url);
        let dataUrl = attachQueryParams(url);

        try {
            const response = await axios({
                url: dataUrl,
                method: 'post',
                data
            });
            console.log(response.data);
            ReCharge.Toast.addToast('success', 'Created successfully');
            window.location.reload();
        } catch(error) {
            console.error(error);
            ReCharge.Toast.addToast('error', 'Create failed');
        } finally {
            delete window.locked;
        }
    },
    put: async function(endpoint, id, data) {
        if (window.locked) { return false; } else { window.locked = true; }
        if (typeof(endpoint) === 'undefined' || typeof(id) === 'undefined') { return false; }

        var url = ReCharge.Endpoints[endpoint](id, data);
        console.log('put', url);
        let dataUrl = attachQueryParams(url);

        try {
            const response = await axios({
                url: dataUrl,
                method: 'post',
                data
            });
            console.log(response.data);
            ReCharge.Toast.addToast('success', 'Updated successfully');
            if (data && data.redirect_url) {
                window.location.href = attachQueryParams(data.redirect_url);
            } else {
                window.location.reload();
            }
        } catch(error) {
            console.error(error.response.data.error);
            ReCharge.Toast.addToast('error', error.response.data.error);
        } finally {
            delete window.locked;
        }
    },
    sendRequest: async function(evt) {
        evt.preventDefault();
        if (window.locked) {
            return false;
        }

        ReCharge.Forms.resetErrors();
        const form = evt.target;
        let url = form.getAttribute('action');
        let submitBtn = evt.target.querySelector('[type="submit"]');
        let buttonText = submitBtn.innerText;

        ReCharge.Forms.toggleSubmitButton(submitBtn);

        let dataUrl = attachQueryParams(url);
        let redirectUrl = form.querySelector('[name="redirect_url"]') || null;

        try {
            const response = await axios({
                url: dataUrl,
                method: 'post',
                data: new FormData(form)
            });
            console.log(response.data);

            ReCharge.Toast.addToast('success', 'Updates saved successfully');
            if (redirectUrl !== null) {
                window.location.href = attachQueryParams(redirectUrl.value.split('?')[0]);
            } else {
                window.location.reload();
            }
        } catch(errorData) {
            ReCharge.Forms.toggleSubmitButton(submitBtn);
            submitBtn.innerText = buttonText;

            const errors = ReCharge.Forms.decodeResponse(errorData.response.data);
            console.error('errors', errors);

            if (typeof (errors) === 'object') {
                ReCharge.Forms.printAllErrors(evt.target, errors);
                ReCharge.Toast.addToast('error', 'Fix form errors to save updates.');
            } else {
                ReCharge.Toast.addToast('error', ReCharge.Forms.prettyError(errors));
            }
        } finally {
            delete window.locked;
        }
    }
}

ReCharge.Schemas = {
    subscriptions: function(id) {
        if (id) {
        return '{ "subscription": { "id": ' + id + ' } }';
        }
        return '{ "subscriptions": { "product": {} } }' ;
    }
};

ReCharge.Subscription = {
    list: function() {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.subscriptions());
    },
    get: function(id) {
        return ReCharge.Actions.get('request_objects', null, ReCharge.Schemas.subscriptions(id));
    },
    create: function(data) {
        return ReCharge.Actions.post('create_subscription_url', data);
    },
    update: function(id, data) {
        return ReCharge.Actions.put('update_subscription_url', id, data);
    },
    activate: function(id) {
        return ReCharge.Actions.put('activate_subscription_url', id, {});
    },
    skip: function(id, charge_id, date) {
        return ReCharge.Actions.put('skip_subscription_url', id, { charge_id: charge_id, date: date });
    },
    unskip: function(id, charge_id) {
        return ReCharge.Actions.put('unskip_subscription_url', id, { charge_id: charge_id });
    },
    setChargeDate: function(id, date) {
        return ReCharge.Actions.put('subscription_charge_date_url', id, { date: date });
    },
    delay: function(id, delay) {
        return ReCharge.Actions.put('delay_subscription_url', id, { days: delay });
    },
    swap: function(id, variant_id) {
        return ReCharge.Actions.put('swap_subscription_url', id, { shopify_variant_id: variant_id });
    },
    cancel: function(id, strategy, data) {
        if (typeof(data) === 'undefined') { data = {}; }
        return ReCharge.Actions.put('retention_strategy_url', { id: id, strategy: strategy }, data);
    },
};

ReCharge.Discount = {
    apply: function(id, discount_code) {
        return ReCharge.Actions.put('apply_discount_to_address_url', id, { 'discount_code': discount_code });
    },
    remove: function(id, discount_code) {
        return ReCharge.Actions.put('remove_discount_from_address_url', id, { 'discount_code': discount_code });
    },
    calculateDiscountedPrice: function(product, price) {
        if (product.subscription_defaults) {
            const hasDiscount = product.discount_amount && product.discount_amount !== 0 || false;
            if (hasDiscount) {
                if (product.discount_type == 'percentage') {
                    price *= 1 - product.discount_amount / 100;
                } else {
                    price -= product.discount_amount;
                }
            }
        }

        return price;

    }
};

if (window.location.pathname.indexOf("{{ shopify_proxy_url if proxy_redirect else '' }}") == -1) {
    ReCharge.Endpoints.base = '/portal/{{ customer.hash }}/';
}

document.addEventListener('submit', async evt => {
    const formId = 'ReChargeForm_';

    if (!evt.target.id.toString().includes(formId)) {
        return;
    }

    ReCharge.Actions.sendRequest(evt);
});
