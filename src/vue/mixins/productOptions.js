import isEqual from "lodash.isequal";
import uniq from "lodash.uniq";
export default {
  props: {
    productData: {
      type: Object,
      required: true,
    },
  },

  data() {
    return {
      selectedOptions: [],
    };
  },

  created() {
    this.getInitialOptionValues();
  },

  computed: {
    ...mapState("product", ["selectedVariant"]),

    firstOption() {
      return this.selectedOptions.find(option => option.position === 1);
    },

    eligibleVariants() {
      console.log("eligible variants");
      /**
       * Assumes `option1` is the "anchored" option
       * Anchored meaning all other options depend on this to be set.
       * For Fulton that is gender
       */
      return this.firstOption
        ? this.productData.variants.filter(
            variant => variant.option1 === this.firstOption.value,
          )
        : [];
    },

    eligibleOptions() {
      /**
       * Create an array of options that we want to show
       * Create a method that checks if the option in the DOM is in the array of available options
       * Assume option position 1 is GENDER
       */
      return uniq(
        this.eligibleVariants.flatMap(variant => {
          return [variant.option2, variant.option3];
        }),
      );
    },

    variantToPurchase() {
      console.log(this.selectedOptions);
      const flatOptions = this.selectedOptions
        .map(option => String(option.value))
        .sort();
      const found = this.productData.variants.find(variant => {
        return isEqual(flatOptions, variant.options.sort());
      });

      return found;
    },

    productOptions() {
      if (!this.productData) return;
      console.log("-- product options, ", this.productData);
      return this.productData.options;
    },
  },

  methods: {
    getInitialOptionValues() {
      const localOptions = [];
      const firstAvailableVariant = this.productData.variants.find(
        variant => variant.available,
      );
      this.productData.options.map(option => {
        localOptions.push({
          type: option.name.toLowerCase(),
          value: firstAvailableVariant[`option${option.position}`],
          position: option.position,
        });
      });

      this.selectedOptions = localOptions;
    },
    findVariantsByOptions(obj) {
      const index = this.selectedOptions.findIndex(
        opt => opt.type === obj.type,
      );

      if (index == -1) {
        this.selectedOptions.push(obj);
      } else {
        this.selectedOptions.splice(index, 1, obj);
      }
    },

    isActiveOption(option) {
      console.log("option: ", option);
      // if (!this.selectedOptions) return false;
      return this.selectedOptions.find(opt => isEqual(opt, option));
    },

    isVisibleOption(option) {
      // if (!this.selectedOptions) return false;
      /**
       * Option 1 is the "anchor" option that always needs to be skipped because it always needs to be available
       */
      if (option.position === 1) {
        return true;
      } else {
        return this.eligibleOptions.includes(String(option.value));
      }
    },
  },
};
