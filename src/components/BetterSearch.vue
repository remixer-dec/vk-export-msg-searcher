<template>
<div :class="classNames">
	<div class="Search__in">
		<div class="Search__width" />
		<div class="Search__control">
			<input v-bind="$attrs" :id="'search-'+searchId" ref="input" type="text" class="Search__input" v-model="textvalue" :autoComplete="autoComplete"
                @focus="focusHandler" @blur="blurHandler" @keydown.enter="enterClicked" />
			<div class="Search__after-width" v-if="!!$slots.after">
			</div>
			<label class="Search__placeholder" :for="'search-'+searchId">
          <div class="Search__placeholder-in">
            <vkui-icon name="search" size="16" />
            <div class="Search__placeholder-text" v-html="computedPlaceholder" />
          </div>
        </label>
		</div>
		<div class="Search__after" @click="enterClicked">
			<div class="Search__after-in">
				Поиск
			</div>
		</div>
	</div>
</div>
</template>

<script>
import getClassName from '@urapywka/vkui/src/helpers/getClassName'
import classnames from '@urapywka/vkui/src/lib/classnames'

const baseClassName = getClassName('Search')

let searchId = 0

let textCache = {}
export default {
	data: (vue) => ({
		showAfter: false,
		focused: false,
		placeholderOffset: null,
		afterWidth: null,
        textvalue: textCache[vue.$props.cache] || ''
	}),
	inheritAttrs: false,
	computed: {
        computedPlaceholder() {
            return this.textvalue.length > 0 ? '' : this.placeholder
        },
		searchId() {
			return searchId
		},
		classNames() {
			const modifiers = {
				[`Search--${this.theme}`]: true,
				'Search--focused': this.focused,
				'Search--has-value': !!this.value,
				'Search--has-after': !!this.$slots.after
			}
			return classnames(baseClassName, modifiers)
		}
	},
	props: {
        value: {
			type: String,
            dafault: ''
		},
		placeholder: {
			type: String,
			default: 'Поиск'
		},
		theme: {
			type: String,
			required: false,
			default: 'default',
			validator: v => ['header', 'default'].indexOf(v) >= 0
		},
		autoComplete: {
			type: String,
			default: 'off'
		},
        cache: {
            type: String,
            default: 'search'
        }
	},
	created() {
		searchId++
	},
	methods: {
        enterClicked() {
            textCache[this.$props.cache] = this.$refs.input.value
            this.$emit('input', this.$refs.input.value)
        },
		focusHandler() {
			this.focused = true
		},
		blurHandler(e) {
			this.focused = false
			this.$emit('blur', e)
		},
		cancelHandler() {
			this.$emit('input', '')
			this.focused = false
		}
	}
}
</script>



<style>
@import '../../node_modules/@urapywka/vkui/src/styles/common.css';
@import '../../node_modules/@urapywka/vkui/src/components/Search/SearchIOS.css';
.Search.Search--ios.Search--default:not(.Search--focused) input {
    text-align: center;
    transform: translateX(30px);
    color: var(--search_bar_field_tint);
}

</style>
