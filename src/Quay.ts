import { Seaport } from "@opensea/seaport-js";
import { Signer, SeaportConfig, OrderUseCase, CreateOrderAction } from "@opensea/seaport-js/lib/types";
import { JsonRpcProvider } from "@ethersproject/providers";
import { SiweMessage } from "siwe";

export class Quay extends Seaport {
    backendUrl: string;
    session: string;

    constructor(providerOrSigner: JsonRpcProvider | Signer, backendUrl: string, session?: string, considerationConfig?: SeaportConfig | undefined) {
        super(providerOrSigner, considerationConfig)
        if (!session) {
            session = ""
        }
        this.backendUrl = backendUrl
        this.session = session
    }

    // Authentication functions
    /**
     * 
     * @param signer the signer to request verification from
     * @param statement custom text to be included within the Sign-In With Ethereum message
     * @param domain domain of website requesting from
     * @param origin origin of website requesting from
     * @param version the version of the message
     * @param chainId the chainID of the network the signer is on
     * @returns a response from Quay endpoint and session token
     */
	async verify(signer: Signer, statement: string, domain: string, origin: string, version: number, chainId: number) {
		const { message, session } = await this._signInWithEthereum(await signer.getAddress(), statement, domain, origin, version, chainId)
		const signature = await signer.signMessage(message)
		const response = await this._verifySiweSignature(session, message, signature)
        this.session = typeof session === "string" ? session : ""
		return { response, session }
	}
	
    /**
     * 
     * @param session the cookie or session token of user
     * @returns either verified or not.
     */
	async isVerified(session: string) {
		const res = await fetch(`${this.backendUrl}/authenticate`, {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({ session })
		})
	
		return await res.json()
	}

    // Order POST request functions
    /**
     * 
     * @param order the order object from `createOrder()`
     * @returns a JSON response whether order was stored in Quay database or not
     */
    async makeListing(order: OrderUseCase<CreateOrderAction>) {
        const verified = await this.isVerified(this.session);
        if (!verified) throw Error("Invalid session. Unable to execute order.")
        if (!this.backendUrl) throw Error("Invalid Backend URL.")

        const signedOrder = await order.executeAllActions()
        const res = await fetch(`${this.backendUrl}/listings`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session: this.session, listing: JSON.stringify(signedOrder) })
        })
        return await res.json()
    }

    /**
     * 
     * @param order the order object from `createOrder()`
     * @returns a JSON response whether order was stored in Quay database or not
     */
    async makeOffer(order: OrderUseCase<CreateOrderAction>) {
        const verified = await this.isVerified(this.session);
        if (!verified) throw Error("Invalid session. Unable to execute order.")
        if (!this.backendUrl) throw Error("Invalid Backend URL.")

        const signedOrder = await order.executeAllActions()
        const res = await fetch(`${this.backendUrl}/offers`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session: this.session, listing: JSON.stringify(signedOrder) })
        })
        return await res.json()
    }

    // Order GET request functions
    /**
     * 
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    async retrieveListings(
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/listings?limit=${limit}`) :
            await fetch(`${this.backendUrl}/listings`)
        return await res.json()
    }
    
    /**
     * 
     * @param offerer Address of the offerer address of orders
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    async retrieveListingsByOfferer(
        offerer: string,
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/listings?offerer=${offerer}&limit=${limit}`) :
            await fetch(`${this.backendUrl}/listings?offerer=${offerer}`)
        return await res.json()
    }
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    async retrieveListingsByContract(
        contractAddress: string,
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/listings?contract=${contractAddress}&limit=${limit}`) :
            await fetch(`${this.backendUrl}/listings?contract=${contractAddress}`)
        return await res.json()
    }
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param tokenIds An array of token IDs to search for (e.g. ?token_ids=1&token_ids=209). This endpoint will return a list of offers with token_id matching any of the IDs in this array.
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    async retrieveListingsByTokenIds(
        contractAddress: string,
        tokenIds: any[],
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/listings?contract=${contractAddress}&tokenIds=${tokenIds}&limit=${limit}`) :
            await fetch(`${this.backendUrl}/listings?contract=${contractAddress}&tokenIds=${tokenIds}`)
        return await res.json()
    }
    
    /**
     * 
     * @param limit Number of offers to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    async retrieveOffers(
        limit: number
    ) {
        const res = limit ? 
            await fetch(`${this.backendUrl}/offers?limit=${limit}`) :
            await fetch(`${this.backendUrl}/offers`)
        return await res.json()
    }

    /**
     * 
     * @param offerer Address of the offerer address of orders
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    async retrieveOffersByOfferer(
        offerer: string,
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/offers?offerer=${offerer}&limit=${limit}`) :
            await fetch(`${this.backendUrl}/offers?offerer=${offerer}`)
        return await res.json()
    }
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    async retrieveOffersByContract(
        contractAddress: string,
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/offers?contract=${contractAddress}&limit=${limit}`) :
            await fetch(`${this.backendUrl}/offers?contract=${contractAddress}`)
        return await res.json()
    }
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param tokenIds An array of token IDs to search for (e.g. ?token_ids=1&token_ids=209). This endpoint will return a list of offers with token_id matching any of the IDs in this array.
     * @param limit Number of offers to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    async retrieveOffersByTokenIds(
        contractAddress: string,
        tokenIds: string[]|number[],
        limit: number
    ) {
        const res = limit ?
            await fetch(`${this.backendUrl}/offers?contract=${contractAddress}&tokenIds=${tokenIds}&limit=${limit}`) :
            await fetch(`${this.backendUrl}/offers?contract=${contractAddress}&tokenIds=${tokenIds}`)
        return await res.json()
    }

    // Internal functions
    private async _nonce() {
		const res = await fetch(`${this.backendUrl}/nonce`)
		const setCookie = res.headers.get('set-cookie')
		const cookieArray = setCookie?.split(';')
		const cookie = cookieArray? cookieArray[0] : undefined
		return { cookie, nonce: await res.text() }
	}

	private async _createSiweMessage(domain: any, address: string, statement: string, uri: string, version: number, chainId: number, nonce: string) {
		const message = new SiweMessage({
			domain,
			address,
			statement,
			uri,
			version: version.toString(),
			chainId,
			nonce
		})
	
		return message.prepareMessage()
	}
	
	private async _signInWithEthereum(address: string, statement: string, domain: any, uri: string, version: number, chainId: number) {
		const { nonce, cookie } = await this._nonce()
		const message = await this._createSiweMessage(
            domain,
			address,
			statement,
			uri,
			version,
			chainId,
            nonce
		)
	
		return { message, session: cookie }
	}
	
	private async _verifySiweSignature(session: any, message: string, signature: string) {
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