# QuayJS
An extended Javascript library to interact with the Seaport marketplace and Quay backend.

QuayJS extends upon [Seaport.js](https://github.com/ProjectOpenSea/seaport-js) to include additional functions for calling API endpoints to a [Quay](https://github.com/Alcibiades-Capital/quay) backend. Use QuayJS the same way as you would use Seaport.js with the only difference being new capabilities for a full-stack application.

## Getting Started
1. Install the package
```shell
npm install quay-js
```

2. Instantiate your instance of quay using your ethers provider and base url to your Quay backend server.

Here is an example using the injected provider from a browser extension wallet:
```javascript
import { Quay } from "quay-js";
import { ethers } from "ethers";

const provider = new ethers.providers.Web3Provider(window.ethereum);
const BACKEND_URL = process.env.BACKEND_URL;

const quay = new Quay(provider, BACKEND_URL);
```

*Note: this will also instantiate an instance of seaport as you can notice the near identical setup as the one provided in the [seaport.js](https://github.com/ProjectOpenSea/seaport-js) documentation.*

3. Authenticate user before storing orders to Quay

```javascript
const domain = window.location.host;
const origin = window.location.origin;

const { response, session } = await quay.verify(
    signer,
    statement: "My Sign In With Ethereum message",
    domain,
    origin,
    version: 1,
    chainId: 1
);
document.cookie = session;
console.log(response);

// Check if user is authenticated
const response = await quay.isVerified(session)
```
User **MUST** be authenticated to make POST requests to quay. Any time either functions `makeListing` and `makeOffer` are called, the session token from `verify` will be used. So, be sure to add it to the user's cookies as shown above.

4. That's it! You are all set up. BUIDL!!

### Examples
Listing an ERC-721 for 10 ETH and fetching it from Quay:
```javascript
const offerer = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
const token = "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e";
const identifier = "1";

const order = await quay.createOrder(
  {
    offer: [
      {
        itemType: ItemType.ERC721,
        token,
        identifier,
      },
    ],
    consideration: [
      {
        amount: ethers.utils.parseEther("10").toString(),
        recipient: offerer,
      },
    ],
  },
  offerer
);

// executes order actions and stores it in database
await quay.makeListing(order)

// queries the order that was listed
const listing = await quay.retrieveListingsByTokenIds(token, [identifier]);

console.log(listing)
```

Making an offer for an ERC-721 for 10 WETH and fetching it from Quay:
```javascript
const offerer = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";

const order = await quay.createOrder(
  {
    offer: [
      {
        amount: parseEther("10").toString(),
        // WETH
        token: "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
      },
    ],
    consideration: [
      {
        itemType: ItemType.ERC721,
        token: "0x8a90cab2b38dba80c64b7734e58ee1db38b8992e",
        identifier: "1",
        recipient: offerer,
      },
    ],
  },
  offerer
);

// executes order actions and stores it in database
await quay.makeOffer(order)

// queries the order that was offered
const offer = await quay.retrieveOffersByTokenIds(token, [identifier]);

console.log(offer)
```
