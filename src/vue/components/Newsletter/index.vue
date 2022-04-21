<script>
import { mapActions, mapState } from "vuex";
import { subscribe } from 'klaviyo-subscribe';


/**
 * The only thing required for this to run:
 * input field with the `email`
 */
export default {
  name: "Newsletter",
  props: {
    listId: {
      required: true,
      type: String
    },
  },
  data: () => ({
    loading: false,
    success: false,
    message: '',
  }),
  computed: {},
  beforeMount() {},
  mounted() {
    console.log('-- mounted Newsletter --')
  },
  methods: {
    submitHandler(e) {
      e.preventDefault();
      const {
        email
      } = e.target.elements;
      
      this.loading = true;
      
      const messages = {
        success: 'Success!',
        error: 'Error!'
      }
      
      subscribe(this.listID, email.value).then(resp => {
        email.value = 'Submitting...'
        if (resp.success) {
          this.success = true;
          setTimeout(() => {
            e.target.reset();
            this.message = messages.success
          }, 600)
        } else {
          this.message = messages.error
          email.value = '';
        }
        
        this.loading = false;
      });
    }
  },
  render() {
    return this.$slots.default({
      submitHandler: this.submitHandler,
      success: this.success,
      message: this.message,
      loading: this.loading,
    })
  },
};
</script>