function renderAddress(element, address= null) {
    element.innerHTML += `{% include '_address_details.html' %}`;

    const form = document.querySelector('#ReChargeForm_address');
    let actionUrl = ReCharge.Endpoints.list_addresses_url();

    if (address != null) {
        actionUrl = ReCharge.Endpoints.show_address_url(address.id);
        ReCharge.Forms.populateAddressData(address);
        getZipLabel(address.country);
    } else {
        getZipLabel();
    }

    form.setAttribute("action", actionUrl);
}

function addAddressHandler(event) {
    event.preventDefault();
    const modalTitle = event.target.dataset.title;

    ReCharge.Novum.sidebarHeading.innerHTML = modalTitle;
    ReCharge.Novum.sidebarContent.innerHTML = "";

    renderAddress(ReCharge.Novum.sidebarContent);
    document.querySelector(".address-btn").innerHTML = "Create";
    ReCharge.Novum.toggleSidebar();
    getShippingBillingCountries('shipping');
}

function renderAddressDetailsHandler(event) {
    event.preventDefault();

    const addresses = ReCharge.Novum.addresses || [];
    const addressId = event.target.closest(".js-address-edit").dataset.id;
    const address = addresses.find(address => address.id == addressId);
    ReCharge.Novum.sidebarHeading.innerHTML = `Edit shipping address`;
    ReCharge.Novum.sidebarContent.innerHTML = `
        <p class="text-center address-info-msg mb-3">
            Updating this shipping address will update all subscriptions associated with this address.
        </p>
    `;
    renderAddress(ReCharge.Novum.sidebarContent, address);
    getShippingBillingCountries('shipping');
    ReCharge.Novum.toggleSidebar();
}

async function getShippingBillingCountries(type) {
    let countries = JSON.parse(sessionStorage.getItem('rc_shipping_countries')) || [];

    if (type === 'billing') {
        countries = JSON.parse(sessionStorage.getItem('rc_billing_countries')) || [];
    }

    if (countries.length > 0) {
        ReCharge.Forms.buildCountries(type);
        ReCharge.Forms.updateProvinces(document.querySelector("#country"));
    } else {
        try {
            const schema = `{ "shipping_countries": [], "billing_countries": [] }`;

            const url = `${ReCharge.Endpoints.request_objects()}&schema=${schema}`;
            const response = await axios(url);

            validateResponseData(response.data, 'countries');

            sessionStorage.setItem('rc_shipping_countries', JSON.stringify(response.data.shipping_countries));
            sessionStorage.setItem('rc_billing_countries', JSON.stringify(response.data.billing_countries));

            ReCharge.Forms.buildCountries(type);
            ReCharge.Forms.updateProvinces(document.querySelector("#country"));
        } catch (error) {
            console.error(error);
        }
    }
}