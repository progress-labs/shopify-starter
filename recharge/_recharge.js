function configureStore() {
    const settingsStore = {{ settings | json }};
    const rc_products = JSON.parse(sessionStorage.getItem('rc_products')) || null;
    let store = {{ store | json }};

    // Check if store allows adding a product
    if(settingsStore.customer_portal.subscription.add_product) {
        if(!store.domain.includes('mybigcommerce.com')) {
            const addProductBtn = document.querySelector('.js-add-product-btn');
            if (addProductBtn != null) {
                showElement(addProductBtn);
            }
        }
    }

    // Check if store allows viewing of order schedule page
    if (settingsStore.customer_portal.view_order_schedule) {
        document
            .querySelectorAll(".js-schedule-page")
            .forEach(el => {
                el.setAttribute("style", "display: block");
            });
    }
    // Check if store allows editing shipping address
    const editAddressBtn = document.querySelectorAll(".js-address-edit-btn");
    if (settingsStore.customer_portal.edit_shipping_address) {
        if (editAddressBtn != null) {
            editAddressBtn.forEach(btn => { showElement(btn) });
            document
                .querySelectorAll(".js-address-edit")
                .forEach(address => {
                    address.addEventListener("click", renderAddressDetailsHandler)
                });
        }
    } else {
        if (editAddressBtn != null) {
            editAddressBtn.forEach((btn) => showElement(btn));
            document
                .querySelectorAll(".js-address-edit")
                .forEach(address => {
                    ReCharge.Utils.contactStoreWording(
                        address,
                        ReCharge.Utils.renderContactStoreLayout('shipping address'),
                        "Edit address"
                    );
                });
        }
    }
    // Check if store allows editing next charge date
    const editNextChargeDateBtn = document.querySelector(
        ".js-edit-next-charge-date-btn"
    );
    const nextDeliveryContainer = document.querySelector(
        ".js-edit-next-charge-date"
    );
    if (settingsStore.customer_portal.subscription.edit_scheduled_date) {
        if (editNextChargeDateBtn != null) {
            showElement(editNextChargeDateBtn);
            nextDeliveryContainer.addEventListener("click", editNextShipment);
        }
    } else {
        if (editNextChargeDateBtn != null) {
            showElement(editNextChargeDateBtn);
            ReCharge.Utils.contactStoreWording(
                nextDeliveryContainer,
                ReCharge.Utils.renderContactStoreLayout('next shipment'),
                "Next shipment"
            );
        }
    }
    // Check if store allows editing delivery frequency
    const frequencyBtn = document.querySelector(".js-edit-frequency-btn");
    const frequencyContainer = document.querySelector(".js-edit-frequency");
    if (
        settingsStore.customer_portal.subscription.edit_order_frequency !=
        "Prohibited"
    ) {
        if (frequencyBtn != null) {
            showElement(frequencyBtn);
            frequencyContainer.addEventListener("click", editScheduleHandler);
        }
    } else {
        if (frequencyBtn != null) {
            showElement(frequencyBtn);
            ReCharge.Utils.contactStoreWording(
                frequencyContainer,
                ReCharge.Utils.renderContactStoreLayout('delivery frequency'),
                "Deliver every"
            );
        }
    }
    // Check if store allows skip
    if (settingsStore.customer_portal.subscription.skip_scheduled_order) {
        const skipBtns = document.querySelectorAll(".js-skip-btn");
        if (skipBtns != null) {
            skipBtns.forEach(btn => { showElement(btn); });
            document
                .querySelectorAll(".js-skip-handler")
                .forEach(btn => {
                    btn.addEventListener("click", skipShipmentHandler)
                });
        }
        const unskipBtns = document.querySelectorAll(".js-unskip-btn");
        if (unskipBtns != null) {
            unskipBtns.forEach(btn => { showElement(btn); });
            document
                .querySelectorAll(".js-unskip-handler")
                .forEach(btn => {
                    btn.addEventListener("click", unskipShipmentHandler)
                });
        }
    }
    // Check if store allows adding discount
    if (settingsStore.customer_portal.discount_input) {
        const discountBtn = document.querySelector(".js-add-discount-btn");
        if (discountBtn != null) {
            discountBtn.setAttribute("style", "display: block");
        }
    }
    // Check if store allows subscription cancellation
    const cancelBtn = document.querySelector(".js-cancel-sub-btn");
    const orders = JSON.parse(sessionStorage.getItem('rc_orders')) || null;
    if (cancelBtn && orders !== null) {
        ReCharge.Utils.checkIfStoreAllowsCancellation(orders, cancelBtn);
    }
    // Check if store allows reactivating subscription
    if (settingsStore.customer_portal.subscription.reactivate_subscription) {
        const reactivateBtns = document.querySelectorAll(".js-reactivate-btn");
        if (reactivateBtns != null) {
            reactivateBtns.forEach(el => {
                el.setAttribute("style", "display: block");
            });
        }
    }

    // Check if product on edit subscription page is otp addon
    if (ReCharge.Novum.subscription && ReCharge.Novum.subscription.status == "ONETIME") {
        addOnLayout();
    }
}

function needsToken(address) {
    // Check if the URL requires a token
    if (
        address.indexOf("{{ shopify_proxy_url if proxy_redirect else '' }}") ===
        -1
    ) {
        return false;
    }
    let url = new URL(address, window.location),
        params = new URLSearchParams(url.search);
    return !params.get("token");
}
// Return a string URL with "?token=asd2310&preview_standard_theme=2" or "?token=asd2310&preview_theme=1111" params
// attached if they exist on the current location
function attachQueryParams(address) {
    let url = new URL(address, window.location);
    let params = new URLSearchParams(url.search);
    if (!params.get("token")) {
        if (window.customerToken) {
            params.set("token", window.customerToken);
        }
    }

    let preview_theme = (new URLSearchParams(window.location.search)).get("preview_standard_theme");
    if (preview_theme && !params.get("preview_standard_theme")) {
        params.set("preview_standard_theme", preview_theme);
    }

    let themeEnginePreview = (new URLSearchParams(window.location.search)).get("preview_theme");
    if (themeEnginePreview && !params.get("preview_theme")) {
        params.set("preview_theme", themeEnginePreview);
    }

    if(params.toString() === '') {
        url.search = params.toString().concat('?preview=false');
    } else {
        url.search = params.toString();
    }

    return url.toString();
}

(function() {
    // Apply CSS styles
    document.querySelector("body").setAttribute("id", "recharge-novum");

    ReCharge.Novum.sidebarHeading = document.querySelector("#te-modal-heading span");
    ReCharge.Novum.sidebarContent = document.getElementById("te-modal-content");
    ReCharge.Novum.backBtn = document.querySelector('.js-back-btn');
    ReCharge.Novum.toggleSidebar = function() {
        document.querySelector("body").classList.toggle("locked");
        document.getElementById("sidebar-underlay").classList.toggle("visible");
        document.getElementById("te-modal").classList.toggle("visible");
        document.querySelectorAll(".close-sidebar")
            .forEach(sidebar => {
                sidebar.addEventListener('click', ReCharge.Novum.toggleSidebar);
            });
    }
    // Trigger configuration code
    configureStore();
    /*==================
      preview link info
    ==================*/
    const currentUrl = window.location.href;
    if (
        currentUrl.includes("preview_standard_theme") ||
        currentUrl.includes("preview_theme")
    ) {
        document
            .querySelectorAll(".info-modal")
            .forEach((el) => el.setAttribute("style", "display: block;"));
        document.querySelector("body").classList.toggle("locked");
    }
    /*===================
      preview link info
    ===================*/

    // Update links with tokens
    document.querySelectorAll("a")
        .forEach(function(el) {
            let url = el.href;
            if (needsToken(url)) {
                el.href = attachQueryParams(el.href);
            }
        });
    // Update forms with tokens
    document.querySelectorAll("form")
        .forEach(function(form) {
            if (form.action && needsToken(form.action)) {
                form.action = attachQueryParams(form.action);
            }
        });
    // Update inputs with tokens
    document.querySelectorAll("input")
        .forEach(function(el) {
            let url = el.value;
            if (needsToken(url)) {
                if (url.includes('/portal')) {
                    el.value = attachQueryParams(el.value);
                }
            }
        });
    // Watch for DOM changes and apply tokens as necessary
    if (MutationObserver && !!document.getElementById("#ReCharge")) {
        let callback = function(mutationsList, observer) {
            mutationsList
                .filter(function(mutation) {
                    return mutation.type === "childList";
                })
                .forEach(function(mutation) {
                    Array.prototype.slice
                        .call(mutation.addedNodes)
                        .filter(function(node) {
                            return node.tagName === "A";
                        })
                        .forEach(function(node) {
                            let url = node.href;
                            if (needsToken(url)) {
                                node.href = attachQueryParams(node.href);
                            }
                        });
                });
        };
        let observer = new MutationObserver(callback);
        observer.observe(document.querySelector("#ReCharge"), {
            attributes: false,
            childList: true,
            subtree: true,
        });
    }
})()