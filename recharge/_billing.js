function renderBillingAddressHandler(event) {
    event.preventDefault();

    let title = event.target.closest(".rc_element_wrapper").dataset.title;
    ReCharge.Novum.sidebarHeading.innerHTML = title;
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_billing_address_details.html' %}`;

    ReCharge.Novum.toggleSidebar();

    let actionUrl = ReCharge.Endpoints.update_billing_address();

    let billingForm = document.querySelector("#ReChargeForm_customer");
    billingForm.setAttribute("action", actionUrl);
    let address = ReCharge.Novum.payment_sources[0].billing_address;
    ReCharge.Forms.populateAddressData(address);

    getShippingBillingCountries('billing');
    getZipLabel(address.country);
}

function toggleCardSidebar() {
    document.querySelector("body").classList.toggle("locked");
    document
        .getElementById("sidebar-card-underlay")
        .classList.toggle("visible");
    document.getElementById("te-card-modal").classList.toggle("visible");

    window.addEventListener("message", handleCardFrameMessage, false);
}

function preventSidebarToggleOnDeepLink(event) {
    event.stopPropagation();
}

function handleCardFrameMessage(event) {
    if (event.origin.startsWith('https://shopifysubscriptions.com') || event.origin.startsWith('https://admin.rechargeapps.com')) {
        if (event.data && event.data.billingComplete) {
            window.location.reload();
        }
    }

    return;
}

(function() {
    let closeCardSidebars = document.querySelectorAll(".close-card-sidebar");
    closeCardSidebars.forEach(sidebar => {
        sidebar.addEventListener("click", () => {
            window.removeEventListener("message", handleCardFrameMessage, false);
            toggleCardSidebar();

            const creditCardForm = window[0].document.getElementById('credit-card-form'),
                  sepaDebitForm = window[0].document.getElementById('sepa-debit-form'),
                  paymentSelector = window[0].document.getElementById('payment-form-selection-page');

            if (paymentSelector) {
                paymentSelector.style.display = 'block';
                creditCardForm.style.display = 'none';
                sepaDebitForm.style.display = 'none';
            }
        });
    });
})();