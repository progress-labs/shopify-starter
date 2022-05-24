function renderOrderDetails(event) {
    event.preventDefault();

    const orderId = event.target.closest('.rc_card_container').dataset.id;
    const order = ReCharge.Novum.orders.find(order => order.id == orderId);

    ReCharge.Novum.sidebarHeading.innerHTML = "{{ 'Order_Details' | t }}";
    ReCharge.Novum.sidebarContent.innerHTML = `{% include '_order_details.html' %}`;

    // Modify data for correct format
    let processedAt = new Date(order.processed_at)
        .toDateString()
        .split(" ")
        .slice(1)

    const processedAtDate = `${processedAt[0]} ${processedAt[1]}, ${processedAt[2]}`;

    let shippingPrice = 0.00;

    order.shipping_lines && order.shipping_lines.forEach(item => shippingPrice += Number(item.price));

    // Populate values in the modal
    document.querySelector(".order-number").innerHTML = `{{ 'Order' | t }} #${
        order.shopify_order_number
    }`;
    document.querySelector(".order-date").innerHTML = ` ${processedAtDate}`;
    document.querySelector(
        ".order-shipping"
    ).innerHTML = `${getCurrency()}${shippingPrice.toFixed(2)}`;
    document.querySelector(".order-discounts").innerHTML = ` -${getCurrency()}${
        order.total_discounts != null ? Number(order.total_discounts).toFixed(2) : "0.00"
    }`;
    document.querySelector(".order-taxes").innerHTML = ` ${getCurrency()}${
        order.total_tax != 0 ? order.total_tax : "0.00"
    }`;
    document.querySelector(".order-total").innerHTML = ` ${getCurrency()}${
        order.total_price
    }`;

    order.line_items.forEach(line_item => {
        const { quantity, title, price, variant_title} = line_item;
        const lineItemsContainer = document.querySelector('.order-line-items');
        const variantLine = variant_title ? `<p class="order-variant-title">${variant_title}</p>` : '';
        let imageSrc = '//rechargestatic-bootstrapheroes.netdna-ssl.com/static/images/no-image.png';

        if (line_item.images && line_item.images['small']) {
            imageSrc = line_item.images['small']
        }

        lineItemsContainer.innerHTML += `
            <div class="element__border--top rc_card_container">
                <div class="flex-center">
                    <span class="order-photo">
                        <img src="${imageSrc}" alt="${title}">
                    </span>
                    <div>
                        <span class="rc_order_title">${title.replace('Auto renew', '')}</span>
                        ${variantLine}
                        <p class="order-quantity">Qty: ${quantity}</p>
                    </div>
                </div>
                <span class="order-price text-font-14">${getCurrency()}${price}</span>
            </div>
        `;
    });

    ReCharge.Novum.toggleSidebar();
}