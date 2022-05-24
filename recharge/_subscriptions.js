// Open modal to show all products
function addProductHandler(evt) {
    evt.preventDefault();

    // Hide back button
    ReCharge.Novum.backBtn.setAttribute("style", "visibility: hidden");

    ReCharge.Novum.sidebarHeading.innerHTML = "Select product";
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_render_products.html' %}`;

    let products = JSON.parse(sessionStorage.getItem("rc_products"));
    let productsToRender = isOnetimesEnabled(products);

    renderProducts(productsToRender.slice(0, 6), "add");

    let input = document.getElementById("rc_search");
    input.addEventListener("keyup", searchProductsHandler);

    ReCharge.Novum.toggleSidebar();
}

// Get clicked product and call funtion to render product info
function addProductDetailsHandler(evt) {
    evt.preventDefault();

    const productId = evt.target.dataset.productId;
    let product = JSON.parse(sessionStorage.getItem("rc_products")).find(
        prod => prod.shopify_details.shopify_id == productId
    );

    ReCharge.Novum.sidebarHeading.innerHTML = "Edit details";
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_add_product_details.html' %}`;

    renderAddProductDetails(product);
}

// Render product details info to add
function renderAddProductDetails(product) {
    const settings = {{ settings | json }};
    const addresses = ReCharge.Novum.addresses;

    let addressOutput, expire_after_specific_number_of_charges;

    addresses.forEach(address => {
        addressOutput += `
            <option value="${address.id}">
                ${address.first_name} ${address.last_name} ${address.address1} ${address.address2}
            </option>
        `;
    });

    const productContainer = document.querySelector('.rc_add_product_details_container');

    if (product.subscription_defaults &&
        Object.keys(product.subscription_defaults).length > 0 &&
        product.subscription_defaults.expire_after_specific_number_of_charges
    ) {
        expire_after_specific_number_of_charges =  `<input type="hidden" name="expire_after_specific_number_of_charges" value="${product.subscription_defaults.expire_after_specific_number_of_charges}">`;
    } else {
        expire_after_specific_number_of_charges = '';
    }

    productContainer.innerHTML += `
        ${ReCharge.Novum.store.external_platform === 'big_commerce'
            ? `<input type="hidden" name="external_product_id" value="${product.shopify_details.shopify_id}">`
            : ``

        }
        <input type="hidden" name="shopify_variant_id" value="${product.shopify_details.variants[0].shopify_id}">
        <input type="hidden" name="redirect_url" value="{{ schedule_url }}">
        <input type="hidden" id="js-add-product-redirect" name="redirect_url" value="{{ subscription_list_url }}">
        ${expire_after_specific_number_of_charges}

        ${renderSubscriptionProductInfo(product, getDisplayPrice(product))}
        ${renderPurchaseOptions(product, settings)}

        <div id="product_schedule_container">
            ${renderDeliveryOptions(product)}
        </div>

        <div id="shipping_address_container">
            <label class="text-font-14">{{ 'ships_to' | t }}</label>
        </div>

        <div id="product_variant_container">
            <h4>Variants</h4>
            <ul id="product_options_container"></ul>
        </div>

        <div id="product_dates_container"></div>

        <div id="next_charge_date_container"style="display: none;">
            <br>
            <label class="text-font-14">Date format: DD-MM-YYYY</label>
            <br>
            <input type="date" name="next_charge_scheduled_at" id="next_charge_scheduled_at" required class="border-light">
        </div>
        <br>
        <button type="submit" class="rc_btn text-uppercase title-bold"> Add product </button>
    `;

    let addressesContainer = document.querySelector('#shipping_address_container');

    addressesContainer.innerHTML = `
        ${addresses.length < 1
            ? `<span class="color-gray">No address on file.</span> <a href="{{ address_list_url }}" class="text-uppercase title-bold color-turquoise-blue";">Add an address</a>`
            : `<label for="address_id" class="text-font-14"> {{ 'ships_to' | t }} </label><select name="address_id" id="address_id" onchange="updateNextChargeDate(this);">${addressOutput}</select>`
        }
    `;

    renderVariants(product);
    toggleSubscriptionUI();
    updateFormAction();
    updateNextChargeDate();

    // Trigger the variant change callback to ensure correct price display
   triggerVariantUpdate();

    // Show back button
    ReCharge.Novum.backBtn.setAttribute('style', 'visibility: visible');
    // Place onclick event to go back and show product list
    ReCharge.Novum.backBtn.addEventListener('click', addProductHandler);

    // Add handler for subscription/otp creation
   document.querySelector('#subscriptionNewForm').addEventListener('submit', (e) => createProduct(e, product.shopify_details.shopify_id));
}

function reactivateSubscriptionHandler(evt) {
    evt.preventDefault();

    const subscriptionId = evt.target.dataset.id;
    let actionUrl = ReCharge.Endpoints.activate_subscription_url(subscriptionId);
    let redirectUrl = ReCharge.Endpoints.update_subscription_url(subscriptionId);

    // Hide back button
    ReCharge.Novum.backBtn.setAttribute('style', 'visibility: hidden');

    ReCharge.Novum.sidebarHeading.innerHTML = 'Reactivate subscription';
    ReCharge.Novum.sidebarContent.innerHTML = `
        <form action="${actionUrl}" method="post" id="ReChargeForm_activate">
            <input type="hidden" name="redirect_url" value="${redirectUrl}">
            <p class="text-font-14"> Your subscription will be reactivated. </p>
            <br>
            <button type="submit" class="rc_btn"> Reactivate </button>
        </form>
    `;

    ReCharge.Novum.toggleSidebar();
}

async function createProduct(evt, shopifyId, message = 'create') {
    evt.preventDefault();

    let url = evt.target.getAttribute('action');
    url = attachQueryParams(url);
    const submitBtn = evt.target.querySelector('[type="submit"]');
    const formEntries = new FormData(evt.target).entries();
    const data = Object.assign(...Array.from(formEntries, ([x, y]) => ({ [x] : y })));
    const products = JSON.parse(sessionStorage.getItem("rc_products"));
    const chosenProduct = products.find(prod => prod.shopify_details.shopify_id === shopifyId);
    const chosenVariant = chosenProduct.shopify_details.variants.find(variant => variant.shopify_id == data["shopify_variant_id"]);

   const isInStock = checkInventory(chosenVariant);

    if (!isInStock) {
        submitBtn.disabled = true;
        submitBtn.textContent = 'Out of stock';
        ReCharge.Toast.addToast("error", `Product out of stock`);
    } else {
        ReCharge.Forms.toggleSubmitButton(submitBtn);
        try {
            await axios({
                url,
                method: "post",
                data
            });

            if (message === 'create') {
                ReCharge.Toast.addToast("success", `Created product successfully.`);
            } else {
                ReCharge.Toast.addToast("success", `Swapped product successfully.`);
            }

            if (data.redirect_url) {
                window.location.href = data.redirect_url;
            } else {
                window.location.reload();
            }
        } catch (error) {
            console.error(error);
            if (message === 'create') {
                ReCharge.Toast.addToast("error", `Unable to create product`);
            } else {
                ReCharge.Toast.addToast("error", `Unable to swap product`);
            }
            submitBtn.disabled = true;
        }
    }
}
