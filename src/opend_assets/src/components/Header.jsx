import React, { useEffect, useState } from "react";
import logo from "../../assets/CyberFire.svg";
import textLogo from "../../assets/CyberMerge.svg";
// import topImage from "../../assets/CyberFire.svg";
import homeImage from "../../assets/home-img.svg";
import { BrowserRouter, Link, Switch, Route } from "react-router-dom";
import Minter from "./Minter";
import Gallery from "./Gallery";
import { opend } from "../../../declarations/opend";
import CURRENT_USER_ID from "../index";

function Header() {
  const [userOwnedGallery, setUserOwnedGallery] = useState();
  const [listingGallery, setListingGallery] = useState();

  async function getUserNFTs() {
    //this getUserNFTs function can tackle the function "fetchListOfOwnedNFT_id" from main.mo
    const userNFT_IDs = await opend.fetchListOfOwnedNFT_id(CURRENT_USER_ID);
    console.log(userNFT_IDs);
    setUserOwnedGallery(
      <Gallery title="My NFTs" ids={userNFT_IDs} role="collection" />
    );

    const discoverNFT_ID = await opend.fetchDiscoverNFTs_ID();
    console.log(discoverNFT_ID);
    setListingGallery(
      <Gallery title="Discover" ids={discoverNFT_ID} role="discover" />
    );
  }

  useEffect(() => {
    getUserNFTs();
  }, []); // second parameter is an empty array to make sure this funtion only gets triggered once

  return (
    <BrowserRouter forceRefresh={true}>
      <div className="app-root-1">
        <header className="Paper-root AppBar-root AppBar-positionStatic AppBar-colorPrimary Paper-elevation4">
          <div className="Toolbar-root Toolbar-regular header-appBar-13 Toolbar-gutters">
            <div className="header-left-4"></div>
            <img className="header-logo-11" src={logo} />
            <div className="header-vertical-9"></div>
            <Link to="/">
              <img className="header-logo-12" src={textLogo} />
            </Link>
            <div className="header-empty-6"></div>
            <div className="header-space-8"></div>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/discover">Discover</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/minter">Minter</Link>
            </button>
            <button className="ButtonBase-root Button-root Button-text header-navButtons-3">
              <Link to="/collection">My NFTs</Link>
            </button>
          </div>
        </header>
      </div>
      <Switch>
        <Route exact path="/">
          {/* <img className="top-space" src={topImage} /> */}
          <img className="bottom-space" src={homeImage} />
        </Route>
        <Route path="/discover">
          {/* <h1>Discover</h1> */}
          {listingGallery}
        </Route>
        <Route path="/minter">
          <Minter />
        </Route>
        <Route path="/collection">
          {userOwnedGallery}
          {/* <Gallery title="My NFTs" /> */}
        </Route>
      </Switch>
    </BrowserRouter>
  );
}

export default Header;
