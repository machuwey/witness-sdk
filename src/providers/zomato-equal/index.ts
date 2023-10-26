// The zomato-equal orders provider aims to prove the zomato food orders
import { DEFAULT_PORT } from '../../config'
import { Provider } from '../../types'
import {
	getCompleteHttpResponseFromReceipt,
	getHttpRequestHeadersFromTranscript,
} from '../../utils/http-parser'

// params for the request that will be publicly available
// contains the url and food userData of the logged in user
type ZomatoOrderParams = {
	url: string
	userData: string
}

// params required to generate the http request to Zomato
// these would contain fields that are to be hidden from the public,
// including the witness
type ZomatoLoginSecretParams = {
	/** cookie string for authentication */
	cookieStr: string
}
const HOST = 'www.zomato.com'
const HOSTPORT = `${HOST}:${DEFAULT_PORT}`
const PATH = '/webroutes/user/orders?page=1'

const zomatoOrdersEqual: Provider<ZomatoOrderParams, ZomatoLoginSecretParams> = {
	hostPort: HOSTPORT,
	areValidParams(params): params is ZomatoOrderParams {
		return true
	},
	createRequest({ cookieStr }) {

		const data = [
			`GET ${PATH} HTTP/1.1`,
			'Host: ' + HOST,
			'accept: application/json, text/plain, */*',
			`cookie: ${cookieStr}`,
			'user-agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36',
			'\r\n',
		].join('\r\n')
		const cookieStartIndex = data.indexOf(cookieStr)

		return {
			data,
			redactions: [
				{
					fromIndex: cookieStartIndex,
					toIndex: cookieStartIndex + cookieStr.length,
				},
			],
		}
	},
	assertValidProviderReceipt(receipt, { userData }) {
		if(receipt.hostPort !== HOSTPORT) {
			throw new Error(`Invalid hostPort: ${receipt.hostPort}`)
		}

		const req = getHttpRequestHeadersFromTranscript(receipt)
		if(req.method !== 'get') {
			throw new Error(`Invalid method: ${req.method}`)
		}

		if(!req.url.startsWith(PATH)) {
			throw new Error(`Invalid path: ${req.url}`)
		}

		const res = getCompleteHttpResponseFromReceipt(receipt)

		if(res.statusCode !== 200) {
			throw new Error(
				`Invalid Login: ${res.statusCode} received.`
			)
		}


		try {
			const parsedRes = JSON.stringify(JSON.parse(res.body.toString()))
			const parsedClient = JSON.stringify(JSON.parse(userData))


			if(parsedRes !== parsedClient) {
				throw new Error('Invalid data')
			}
		} catch(error) {
			throw new Error(`Invalid response body: ${error.message}`)
		}
	},
}

export default zomatoOrdersEqual
