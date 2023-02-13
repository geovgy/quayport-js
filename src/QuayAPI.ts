import { SiweMessage } from "siwe";
import { Signer } from "ethers/lib/ethers";

export class QuayAPI {
	backendUrl: string;
	domain: string;
	origin: string;

	constructor(backendUrl: string, domain: string, origin: string) {
		this.backendUrl = backendUrl
		this.domain = domain
		this.origin = origin
	}
	
	async nonce() {
		const res = await fetch(`${this.backendUrl}/nonce`)
		const setCookie = res.headers.get('set-cookie')
		const cookieArray = setCookie?.split(';')
		const cookie = cookieArray? cookieArray[0] : undefined
		return { cookie, nonce: await res.text() }
	}

	async verify(signer: Signer, description: string, chainId: number, version: number) {
		const { message, session } = await this.signInWithEthereum(await signer.getAddress(), description, chainId, version)
		const signature = await signer.signMessage(message)
		const response = await this.verifySiweSignature(session, message, signature)
		return { response, session }
	}
	
	async isVerified(session: any) {
		const res = await fetch(`${this.backendUrl}/authenticate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ session })
		})
	
		return await res.json()
	}

	async createSiweMessage(address: string, statement: string, nonce: string, chainId: number, version: number) {
		const domain = this.domain || window.location.host
		const uri = this.origin || window.location.origin
		
		// const response = await getNonce()
		
		const message = new SiweMessage({
			domain,
			address,
			statement,
			uri,
			version: version.toString(),
			chainId,
			nonce
		})
	
		// return { message: message.prepareMessage(), session: response.cookie, nonce: response.nonce }
		return message.prepareMessage()
	}
	
	async signInWithEthereum(address: string, description: string, chainId: number, version: number) {
		const { nonce, cookie } = await this.nonce()
		const message = await this.createSiweMessage(
			address,
			description,
			nonce,
			chainId,
			version
		)
	
		return { message, session: cookie }
	}
	
	async verifySiweSignature(session: any, message: string, signature: string) {
		const res = await fetch(`${this.backendUrl}/verify`, {
			method: "POST",
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ session, message, signature }),
		});
	
		return await res.json()
	}
}