import { Seaport } from "@opensea/seaport-js";
import { Signer, SeaportConfig, OrderUseCase, CreateOrderAction } from "@opensea/seaport-js/lib/types";
import { JsonRpcProvider } from "@ethersproject/providers";
import { SiweMessage } from "siwe";

export class Quay extends Seaport {
    backendUrl: string;
    session: string;

    constructor(providerOrSigner: JsonRpcProvider | Signer, considerationConfig: SeaportConfig | undefined, backendUrl: string, session: string) {
        super(providerOrSigner, considerationConfig)
        this.backendUrl = backendUrl
        this.session = session
    }

    // Core functions

    // Authentication
    async nonce() {
		const res = await fetch(`${this.backendUrl}/nonce`)
		const setCookie = res.headers.get('set-cookie')
		const cookieArray = setCookie?.split(';')
		const cookie = cookieArray? cookieArray[0] : undefined
		return { cookie, nonce: await res.text() }
	}

	async verify(signer: Signer, statement: string, domain: string, origin: string, version: number, chainId: number) {
		const { message, session } = await this.signInWithEthereum(await signer.getAddress(), statement, domain, origin, version, chainId)
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

    // Order POST request functions
    async makeListing(session: any, order: OrderUseCase<CreateOrderAction>) {
        const verified = await this.isVerified(session);
        if (!verified) throw Error("Invalid session. Unable to execute order.")
        if (!this.backendUrl) throw Error("Invalid Backend URL.")

        const signedOrder = await order.executeAllActions()
        const res = await fetch(`${this.backendUrl}/listings`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session, listing: JSON.stringify(signedOrder) })
        })
        return await res.json()
    }

    async makeOffer(session: any, order: OrderUseCase<CreateOrderAction>) {
        const verified = await this.isVerified(session);
        if (!verified) throw Error("Invalid session. Unable to execute order.")
        if (!this.backendUrl) throw Error("Invalid Backend URL.")

        const signedOrder = await order.executeAllActions()
        const res = await fetch(`${this.backendUrl}/offers`, {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ session, listing: JSON.stringify(signedOrder) })
        })
        return await res.json()
    }

    // Order GET request functions
    /**
     * 
     * @param limit Number of listings to retrieve
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

    // Utility functions
    // Authentication
	async createSiweMessage(domain: any, address: string, statement: string, uri: string, version: number, chainId: number, nonce: string) {
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
	
	async signInWithEthereum(address: string, statement: string, domain: any, uri: string, version: number, chainId: number) {
		const { nonce, cookie } = await this.nonce()
		const message = await this.createSiweMessage(
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