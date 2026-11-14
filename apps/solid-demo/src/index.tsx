import { render } from 'solid-js/web'
import { App } from './app'
import '@zixiao-labs/ui-kits-solid/styles.css'
import '@zixiao-labs/ui-kits-solid/patterns.css'
import './styles.css'

const root = document.getElementById('app')
if (!root) throw new Error('Solid demo requires #app.')
render(() => <App />, root)
