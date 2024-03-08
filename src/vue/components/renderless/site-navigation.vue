<script>
import { toRefs } from 'vue';

export default {
    props: {
        menuId: {
            type: String,
            required: true,
        },
        menu: {
            type: Array,
            required: true,
        },
    },
    setup(props, {slots}) {
        const {menuId, menu} = toRefs(props);
        
        return () =>
            slots.default({
                menuId: menuId.value,
                menu: menu.value,
            });
    },
};
</script>
