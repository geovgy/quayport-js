import { SiweMessage } from "siwe";
import { Signer } from "ethers/lib/ethers";

export async function getNonce() {
    const res = await fetch(`/nonce`)
    const setCookie = res.headers.get('set-cookie')
    const cookieArray = setCookie?.split(';')
    const cookie = cookieArray? cookieArray[0] : undefined
    return { cookie, nonce: await res.text() }
}

export async function createSiweMessage(address: string, statement: string, nonce: string, chainId: number, version: number) {
  const domain = window.location.host
  const origin = window.location.origin
  
  // const response = await getNonce()
  
  const message = new SiweMessage({
    domain,
    address,
    statement,
    uri: origin,
    version: version.toString(),
    chainId,
    nonce
  })

  // return { message: message.prepareMessage(), session: response.cookie, nonce: response.nonce }
	return message.prepareMessage()
}

export async function signInWithEthereum(address: string, description: string, chainId: number, version: number) {
	const { nonce, cookie } = await getNonce()
  const message = await createSiweMessage(
    address,
    description,
		nonce,
		chainId,
		version
  )

  return { message, session: cookie }
}

export async function verifySiweSignature(session: any, message: string, signature: string) {
  const res = await fetch(`/verify`, {
    method: "POST",
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ session, message, signature }),
  });

  return await res.json()
}

export async function verify(signer: Signer, description: string, chainId: number, version: number) {
  const { message, session } = await signInWithEthereum(await signer.getAddress(), description, chainId, version)
  const signature = await signer.signMessage(message)
  const response = await verifySiweSignature(session, message, signature)
  return { response, session }
}

export async function isVerified(session: any) {
  const res = await fetch('/authenticate', {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ session })
  })

  return await res.json()
}

/**
 * 
 * @param limit Number of listings to retrieve
 */
export async function retrieveListings(
  limit: number
) {
  const res = limit ?
    await fetch(`/listings?limit=${limit}`) :
    await fetch(`/listings`)
  console.log(res)
  return await res.json()
}

/**
 * 
 * @param offerer Address of the offerer address of orders
 * @param limit Number of listings to retrieve
 */
export async function retrieveListingsByOfferer(
  offerer: string,
  limit: number
) {
  const res = limit ?
    await fetch(`/listings?offerer=${offerer}&limit=${limit}`) :
    await fetch(`/listings?offerer=${offerer}`)
  console.log(res)
  return await res.json()
}

/**
 * 
 * @param contractAddress Address of the contract for an NFT
 * @param limit Number of listings to retrieve
 */
 export async function retrieveListingByContract(
  contractAddress: string,
  limit: number
) {
  const res = limit ?
    await fetch(`/listings?contract=${contractAddress}&limit=${limit}`) :
    await fetch(`/listings?contract=${contractAddress}`)
  console.log(res)
  return await res.json()
}

/**
 * 
 * @param contractAddress Address of the contract for an NFT
 * @param tokenIds An array of token IDs to search for (e.g. ?token_ids=1&token_ids=209). This endpoint will return a list of offers with token_id matching any of the IDs in this array.
 * @param limit Number of listings to retrieve
 */
export async function retrieveListingByToken(
  contractAddress: string,
  tokenIds: any[],
  limit: number
) {
  const res = limit ?
    await fetch(`/listings?contract=${contractAddress}&tokenIds=${tokenIds}&limit=${limit}`) :
    await fetch(`/listings?contract=${contractAddress}&tokenIds=${tokenIds}`)
  console.log(res)
  return await res.json()
}

/**
 * 
 * @param limit Number of offers to retrieve
 */
export async function retrieveOffers(
  limit: number
) {
  const res = limit ? 
    await fetch(`/offers?limit=${limit}`) :
    await fetch(`/offers`)
  return await res.json()
}

/**
 * 
 * @param contractAddress Address of the contract for an NFT
 * @param tokenIds An array of token IDs to search for (e.g. ?token_ids=1&token_ids=209). This endpoint will return a list of offers with token_id matching any of the IDs in this array.
 * @param limit Number of offers to retrieve
 */
 export async function retrieveOffersByToken(
  contractAddress: string,
  tokenIds: string[]|number[],
  limit: number
) {
  const res = limit ?
    await fetch(`/offers?contract=${contractAddress}&tokenIds=${tokenIds}&limit=${limit}`) :
    await fetch(`/offers?contract=${contractAddress}&tokenIds=${tokenIds}`)
  return await res.json()
}