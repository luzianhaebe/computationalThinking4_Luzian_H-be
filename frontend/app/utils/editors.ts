import BoldEditor from '~/components/editors/BoldEditor.vue'
import BorderEditor from '~/components/editors/BorderEditor.vue'
import ColorEditor from '~/components/editors/ColorEditor.vue'
import FontSizeEditor from '~/components/editors/FontSizeEditor.vue'

// Which editor edits which attribute. The context bar shows an editor only if the item has its attribute.
export const ATTRIBUTE_EDITORS = [
  { attribute: 'color', component: ColorEditor },
  { attribute: 'fontSize', component: FontSizeEditor },
  { attribute: 'bold', component: BoldEditor },
  { attribute: 'border', component: BorderEditor },
] as const
