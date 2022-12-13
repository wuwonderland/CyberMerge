import React, { useEffect, useState } from "react";
import { propTypes } from "../../../../node_modules/react-bootstrap/esm/Image";
import Item from "./Item";
import { Principal } from "@dfinity/principal";

function Gallery(props) {
  // const NFT_CANISTER_ID = "rrkah-fqaaa-aaaaa-aaaaq-cai";

  const [items, setItems] = useState();

  function fetchNFTs() {
    if (props.ids != undefined) {
      setItems(
        props.ids.map((NFT_ID) => (
          <Item id={NFT_ID} key={NFT_ID.toText()} role={props.role} />
        ))
      );
    }
  }

  useEffect(() => {
    // useEffect takes effect when we need to execute a function once it is been triggered.
    fetchNFTs();
  }, []);

  return (
    <div className="gallery-view">
      <h3 className="makeStyles-title-99 Typography-h3">{props.title}</h3>
      <div className="disGrid-root disGrid-container disGrid-spacing-xs-2">
        <div className="disGrid-root disGrid-item disGrid-grid-xs-12">
          <div className="disGrid-root disGrid-container disGrid-spacing-xs-5 disGrid-justify-content-xs-center">
            {items}
          </div>

          {/* <Item id={NFT_CANISTER_ID} /> */}
        </div>
      </div>
    </div>
  );
}

export default Gallery;
