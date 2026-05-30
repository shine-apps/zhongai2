import type { App } from 'vue'

// Wot Design UI components - global registration for H5 mode
// (easycom auto-import only works in mini-program mode, not H5)
import WdActionSheet from 'wot-design-uni/components/wd-action-sheet/wd-action-sheet.vue'
import WdAvatar from 'wot-design-uni/components/wd-avatar/wd-avatar.vue'
import WdBadge from 'wot-design-uni/components/wd-badge/wd-badge.vue'
import WdButton from 'wot-design-uni/components/wd-button/wd-button.vue'
import WdCell from 'wot-design-uni/components/wd-cell/wd-cell.vue'
import WdCellGroup from 'wot-design-uni/components/wd-cell-group/wd-cell-group.vue'
import WdCheckbox from 'wot-design-uni/components/wd-checkbox/wd-checkbox.vue'
import WdCheckboxGroup from 'wot-design-uni/components/wd-checkbox-group/wd-checkbox-group.vue'
import WdDivider from 'wot-design-uni/components/wd-divider/wd-divider.vue'
import WdForm from 'wot-design-uni/components/wd-form/wd-form.vue'
import WdGrid from 'wot-design-uni/components/wd-grid/wd-grid.vue'
import WdGridItem from 'wot-design-uni/components/wd-grid-item/wd-grid-item.vue'
import WdIcon from 'wot-design-uni/components/wd-icon/wd-icon.vue'
import WdImg from 'wot-design-uni/components/wd-img/wd-img.vue'
import WdInput from 'wot-design-uni/components/wd-input/wd-input.vue'
import WdLoadmore from 'wot-design-uni/components/wd-loadmore/wd-loadmore.vue'
import WdLoading from 'wot-design-uni/components/wd-loading/wd-loading.vue'
import WdOverlay from 'wot-design-uni/components/wd-overlay/wd-overlay.vue'
import WdPopup from 'wot-design-uni/components/wd-popup/wd-popup.vue'
import WdRadio from 'wot-design-uni/components/wd-radio/wd-radio.vue'
import WdRadioGroup from 'wot-design-uni/components/wd-radio-group/wd-radio-group.vue'
import WdRootPortal from 'wot-design-uni/components/wd-root-portal/wd-root-portal.vue'
import WdSearch from 'wot-design-uni/components/wd-search/wd-search.vue'
import WdSelectPicker from 'wot-design-uni/components/wd-select-picker/wd-select-picker.vue'
import WdSkeleton from 'wot-design-uni/components/wd-skeleton/wd-skeleton.vue'
import WdStatusTip from 'wot-design-uni/components/wd-status-tip/wd-status-tip.vue'
import WdSticky from 'wot-design-uni/components/wd-sticky/wd-sticky.vue'
import WdStickyBox from 'wot-design-uni/components/wd-sticky-box/wd-sticky-box.vue'
import WdSwiper from 'wot-design-uni/components/wd-swiper/wd-swiper.vue'
import WdSwiperNav from 'wot-design-uni/components/wd-swiper-nav/wd-swiper-nav.vue'
import WdTab from 'wot-design-uni/components/wd-tab/wd-tab.vue'
import WdTabs from 'wot-design-uni/components/wd-tabs/wd-tabs.vue'
import WdTag from 'wot-design-uni/components/wd-tag/wd-tag.vue'
import WdTextarea from 'wot-design-uni/components/wd-textarea/wd-textarea.vue'
import WdTransition from 'wot-design-uni/components/wd-transition/wd-transition.vue'

const components: Record<string, any> = {
  WdActionSheet,
  WdAvatar,
  WdBadge,
  WdButton,
  WdCell,
  WdCellGroup,
  WdCheckbox,
  WdCheckboxGroup,
  WdDivider,
  WdForm,
  WdGrid,
  WdGridItem,
  WdIcon,
  WdImg,
  WdInput,
  WdLoadmore,
  WdLoading,
  WdOverlay,
  WdPopup,
  WdRadio,
  WdRadioGroup,
  WdRootPortal,
  WdSearch,
  WdSelectPicker,
  WdSkeleton,
  WdStatusTip,
  WdSticky,
  WdStickyBox,
  WdSwiper,
  WdSwiperNav,
  WdTab,
  WdTabs,
  WdTag,
  WdTextarea,
  WdTransition,
}

export function registerWdComponents(app: App) {
  for (const [name, component] of Object.entries(components)) {
    app.component(name, component)
  }
}
