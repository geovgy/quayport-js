import { Seaport } from "@opensea/seaport-js";
import { SeaportConfig, OrderUseCase, CreateOrderAction } from "@opensea/seaport-js/lib/types";
import { JsonRpcProvider } from "@ethersproject/providers";
import { Signer } from "@opensea/seaport-js/lib/types";

export declare class Quay extends Seaport {
    backendUrl: string;
    session: string;

    constructor(providerOrSigner: JsonRpcProvider | Signer, backendUrl: string, session?: string, considerationConfig?: SeaportConfig | undefined);

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
	verify(signer: Signer, statement: string, domain: string, origin: string, version: number, chainId: number): Promise<{response: JSON, session: string}>
	
    /**
     * 
     * @param session the cookie or session token of user
     * @returns either verified or not.
     */
	isVerified(session: string): Promise<JSON>

    // Order POST request functions
    /**
     * 
     * @param order the order object from `createOrder()`
     * @returns a JSON response whether order was stored in Quay database or not
     */
    makeListing(order: OrderUseCase<CreateOrderAction>): Promise<JSON>

    /**
     * 
     * @param order the order object from `createOrder()`
     * @returns a JSON response whether order was stored in Quay database or not
     */
    makeOffer(order: OrderUseCase<CreateOrderAction>): Promise<JSON>

    // Order GET request functions
    /**
     * 
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    retrieveListings(limit: number): Promise<JSON>
    
    /**
     * 
     * @param offerer Address of the offerer address of orders
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    retrieveListingsByOfferer(offerer: string, limit: number): Promise<JSON>
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    retrieveListingsByContract(contractAddress: string, limit: number): Promise<JSON>
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param tokenIds An array of token IDs to search for (e.g. ?token_ids=1&token_ids=209). This endpoint will return a list of offers with token_id matching any of the IDs in this array.
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as listings in the Quay database
     */
    retrieveListingsByTokenIds(contractAddress: string, tokenIds: any[], limit: number): Promise<JSON>
    
    /**
     * 
     * @param limit Number of offers to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    retrieveOffers(limit: number): Promise<JSON>

    /**
     * 
     * @param offerer Address of the offerer address of orders
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    retrieveOffersByOfferer(offerer: string, limit: number): Promise<JSON>
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param limit Number of listings to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    retrieveOffersByContract(contractAddress: string, limit: number): Promise<JSON>
    
    /**
     * 
     * @param contractAddress Address of the contract for an NFT
     * @param tokenIds An array of token IDs to search for (e.g. ?token_ids=1&token_ids=209). This endpoint will return a list of offers with token_id matching any of the IDs in this array.
     * @param limit Number of offers to retrieve
     * @returns a queried list of orders stored as offers in the Quay database
     */
    retrieveOffersByTokenIds(contractAddress: string, tokenIds: string[]|number[], limit: number): Promise<JSON>

    // Internal functions
    private _nonce(): Promise<JSON>

	private _createSiweMessage(domain: any, address: string, statement: string, uri: string, version: number, chainId: number, nonce: string): Promise<JSON>
	
	private _signInWithEthereum(address: string, statement: string, domain: any, uri: string, version: number, chainId: number): Promise<JSON>
	
	private _verifySiweSignature(session: any, message: string, signature: string): Promise<JSON>
}