import '../styles.css'
import 'reactflow/dist/style.css'
import ToastHost from '../components/ToastHost'
export default function App({ Component, pageProps }) {
  return (
    <>
      <Component {...pageProps} />
      <ToastHost />
    </>
  )
}
