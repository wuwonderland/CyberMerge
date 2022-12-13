import React, { useEffect, useState } from "react";
import logo from "../../assets/logo.png";
import { Actor, HttpAgent } from "@dfinity/agent";
import { idlFactory } from "../../../declarations/nft";
import { idlFactory as tokenIdlFactory } from "../../../declarations/token";
import { Principal } from "@dfinity/principal";
import { opend } from "../../../declarations/opend";
import Button from "./Button";
import CURRENT_USER_ID from "../index";
import PriceLabel from "./PriceLabel";
import { canisterId } from "../../../declarations/nft/index";

function Item(props) {
  const [name, setName] = useState();
  const [owner, setOwner] = useState();
  const [image, setImage] = useState();
  const [button, setButton] = useState();
  const [priceInput, setPriceInput] = useState();
  const [loaderHidden, setLoaderHidden] = useState(true);
  const [blur, setBlur] = useState();
  const [sellStatus, setSellStatus] = useState("");
  const [priceLabel, setPriceLabel] = useState();
  const [shouldDisplayItem, setShouldDisplayItem] = useState(true);

  const id = props.id;

  const localHost = "http://localhost:8080/";

  const agent = new HttpAgent({ host: localHost }); //agent help run http request in order to get hold of canisters, which we got from npm package: agent.
  // TODO: when deploy this project live, we should remove this line, agent.fetchRootKey();
  agent.fetchRootKey();

  let NFT_ACTOR; // using NFT function Actor Class from nft.mo

  async function httpRequestLoadNFT() {
    NFT_ACTOR = await Actor.createActor(idlFactory, {
      agent,
      canisterId: id,
    }); //idl = Interface Description Language. Translator between Motoko and JavaScript

    const name = await NFT_ACTOR.getName();
    const owner = await NFT_ACTOR.getOwner();

    const imageData = await NFT_ACTOR.getAsset(); //called getAsset for image data from canister.
    const imageContent = new Uint8Array(imageData); //convert [Nat8] array from nft.mo to Uint8Array.
    const imageURL = URL.createObjectURL(
      new Blob([imageContent.buffer], { type: "image/png" })
    ); //convert image content into URL so it can be read by javascript.

    setName(name);
    setOwner(owner.toText());
    setImage(imageURL);

    if (props.role == "collection") {
      // if Gallery webpage is chosen for rendering collection then show sell button or other way if listed for sale
      const NFTisListed = await opend.isListed(props.id);

      if (NFTisListed) {
        setOwner("OpenD");
        setBlur({ filter: "blur(4px)" });
        setSellStatus("Listed For Sale");
      } else {
        setButton(<Button handleClick={handleSellNFT} text={"Sell"} />);
      }
    } else if (props.role == "discover") {
      // if Discover webpage is chosen for rendering discover then show buy button
      const originalOwner = await opend.getOriginalOwner(props.id);

      if (originalOwner.toText() != CURRENT_USER_ID.toText()) {
        // we don't want our originalOwner to buy his/her NFT after put on sale because he/she wants to sell and not buy back
        setButton(<Button handleClick={handleBuyNFT} text={"Buy"} />);
      }

      const price = await opend.getListedNFTPrice(props.id);
      setPriceLabel(<PriceLabel sellPrice={price.toString()} />); //Price to string for <span/>
    }
  }

  useEffect(() => {
    httpRequestLoadNFT();
  }, []); // [] is used to monitor how many times useEffect function should be called.

  let price;
  function handleSellNFT() {
    console.log("Sell clicked");
    setPriceInput(
      <input
        placeholder="Price in GENIOUS"
        type="number"
        className="price-input"
        value={price}
        onChange={(e) => (price = e.target.value)}
      />
    );
    setButton(<Button handleClick={sellItem} text={"Confirm"} />);
  }

  async function sellItem() {
    setBlur({ filter: "blur(4px)" }); // attribute filter for setting blur of 4 pixels
    setLoaderHidden(false); //once the user clicked on confirm button, the loader is unhidden
    console.log("Set Price = " + price);

    const listingResult = await opend.listItem(props.id, Number(price));

    console.log("Listing: " + listingResult);

    if (listingResult == "Success") {
      // The text "Success" need to match with "Success" in main.mo
      const openD_ID = await opend.getOpenDCanisterID();
      const transferResult = await NFT_ACTOR.transferOwnership(openD_ID);

      console.log("Transfer: " + transferResult);

      if (transferResult == "Success") {
        // The text "Success" need to match with "Success" in nft.mo
        setLoaderHidden(true); //once the transferResult is success then loader is hidden.
        setButton(); //hidden button with empty parameter once the process of transfering is done.
        setPriceInput(); //hidden PriceInput with empty parameter once the process of transfering is done.
        setOwner("OpenD"); // Display the current NFT ownership after transfering is done.
        setSellStatus("Listed For Sale");
      }
    }
  }

  async function handleBuyNFT() {
    console.log("handle Buy Button Clicked");
    setLoaderHidden(false);

    const token_ACTOR = await Actor.createActor(tokenIdlFactory, {
      agent,
      canisterId: Principal.fromText("qjdve-lqaaa-aaaaa-aaaeq-cai"),
    });

    const sellerID = await opend.getOriginalOwner(props.id);
    const itemPrice = await opend.getListedNFTPrice(props.id);

    const result = await token_ACTOR.transfer(sellerID, itemPrice); // result is of type Text
    // console.log(result);
    if (result == "Success") {
      // Transfer the ownership to Buyer
      const transferResult = await opend.completePurchase(
        props.id,
        sellerID,
        CURRENT_USER_ID
      );
      console.log("Purchase: " + transferResult);
      setLoaderHidden(true);
      setShouldDisplayItem(false);
    }
  }

  return (
    <div
      style={{ display: shouldDisplayItem ? "inline" : "none" }}
      className="disGrid-item"
    >
      <div className="disPaper-root disCard-root makeStyles-root-17 disPaper-elevation1 disPaper-rounded">
        <img
          className="disCardMedia-root makeStyles-image-19 disCardMedia-media disCardMedia-img"
          src={image}
          style={blur}
        />
        <div className="lds-ellipsis" hidden={loaderHidden}>
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
        <div className="disCardContent-root">
          {priceLabel}
          <h2 className="disTypography-root makeStyles-bodyText-24 disTypography-h5 disTypography-gutterBottom">
            {name}
            <span className="purple-text"> {sellStatus} </span>
          </h2>
          <p className="disTypography-root makeStyles-bodyText-24 disTypography-body2 disTypography-colorTextSecondary">
            Owner: {owner}
          </p>
          {priceInput}
          {button}
        </div>
      </div>
    </div>
  );
}

export default Item;
