import Cycles "mo:base/ExperimentalCycles";
import Debug "mo:base/Debug";
import NFTActorClass "../NFT/nft";
import Principal "mo:base/Principal";
import HashMap "mo:base/HashMap";
import List "mo:base/List";
import Iter "mo:base/Iter";

actor OpenD {

   private type Listing = {
      //custom type for mapOfNFTListings's data type of value
      itemOwner : Principal;
      itemPrice : Nat;
   };

   // all map using hashmap is of optional type:
   var mapOfNFTs = HashMap.HashMap<Principal, NFTActorClass.NFT>(
      1,
      Principal.equal,
      Principal.hash,
   );

   var mapOfOwners = HashMap.HashMap<Principal, List.List<Principal>>(
      1,
      Principal.equal,
      Principal.hash,
   );

   var mapOfNFTListings = HashMap.HashMap<Principal, Listing>(
      1,
      Principal.equal,
      Principal.hash,
   );

   public shared (msg) func mint(imgData : [Nat8], name : Text) : async Principal {
      //return is a Principal type of newly minted canister.
      let owner : Principal = msg.caller;
      //once onSubmit triggers, msg.caller will pass in the principal ID.

      Debug.print(debug_show (Cycles.balance()));
      //debug to show the balance before canister is created.
      Cycles.add(100_500_000_000);
      let newNFT = await NFTActorClass.NFT(name, owner, imgData);
      //create new canister.

      Debug.print(debug_show (Cycles.balance()));
      //debug to show new canister.

      let newNFTPrincipal = await newNFT.getCanisterID();

      mapOfNFTs.put(newNFTPrincipal, newNFT);
      //once we get hold on our mapOfNFTs we can use put() method to put a new item into that Hash Map

      addToOwnershipMap(owner, newNFTPrincipal);
      //call this method to trigger when a new minting is happening

      return newNFTPrincipal;
   };

   private func addToOwnershipMap(
      owner : Principal,
      newlyMintedNFT_ID : Principal,
   ) {
      var currentOwnedNFTs : List.List<Principal> = switch (mapOfOwners.get(owner)) {
         //here we figure out if current owner has nft already in the list or first time minted NFT if first time then it will be nil.
         case null List.nil<Principal>();
         case (?result) result;
         //2nd case shows we got result, so first term shows to unwrap the optional result. Second term shows we set the currentOwnedNFT to unwrapped version of that result.
      };
      //push our newly minted NFT to this currentOwnedNFTs list:
      currentOwnedNFTs := List.push(newlyMintedNFT_ID, currentOwnedNFTs);

      mapOfOwners.put(owner, currentOwnedNFTs);
   };

   public query func fetchListOfOwnedNFT_id(user : Principal) : async [Principal] {
      var userNFTs : List.List<Principal> = switch (mapOfOwners.get(user)) {
         case null List.nil<Principal>();
         case (?result) result;
      };

      return List.toArray(userNFTs);
      //convert userNFTs list into an array
   };

   public query func fetchDiscoverNFTs_ID() : async [Principal] {
      //fetchDiscoverNFTs_ID for Header.jsx
      let ids = Iter.toArray(mapOfNFTListings.keys()); //make keys inside the map of NFT listing array iteratable.
      return ids;
   };

   public shared (msg) func listItem(id : Principal, price : Nat) : async Text {
      var item : NFTActorClass.NFT = switch (mapOfNFTs.get(id)) {
         case null return "NFT does not exist.";
         case (?result) result;
      };

      let owner = await item.getOwner();
      if (Principal.equal(owner, msg.caller)) {
         let newListing : Listing = {
            //create new list for new NFT
            itemOwner = owner;
            itemPrice = price;
         };

         mapOfNFTListings.put(id, newListing);
         return "Success";
      } else {
         return "You are not the owner of this NFT.";
      };
   };

   public query func getOpenDCanisterID() : async Principal {
      return Principal.fromActor(OpenD);
   };

   public query func isListed(id : Principal) : async Bool {
      //check if NFT item is sold.
      if (mapOfNFTListings.get(id) == null) {
         return false;
      } else {
         return true;
      };
   };

   public query func getOriginalOwner(id : Principal) : async Principal {
      var listing : Listing = switch (mapOfNFTListings.get(id)) {
         case null return Principal.fromText(""); //case null we give empty Principal in text/string
         case (?result) result; //unwrap the optional result
      };

      return listing.itemOwner;
   };

   public query func getListedNFTPrice(id : Principal) : async Nat {
      var listing : Listing = switch (mapOfNFTListings.get(id)) {
         case null return 0;
         case (?result) result;
      };

      return listing.itemPrice;
   };

   public shared (msg) func completePurchase(soldItemID : Principal, ownerID : Principal, newOwnerID : Principal) : async Text {
      var purchasedNFT : NFTActorClass.NFT = switch (mapOfNFTs.get(soldItemID)) {
         case null return "NFT does not exist.";
         case (?result) result; //unwrap the optional result
      };

      let transferOwnershipToBuyer = await purchasedNFT.transferOwnership(newOwnerID);
      if (transferOwnershipToBuyer == "Success") {
         mapOfNFTListings.delete(soldItemID); //delete the original owner from our mapOfNFTListings so we don't need to keep track with this listing anymore
         var currentOwnerNFTs : List.List<Principal> = switch (mapOfOwners.get(ownerID)) {
            case null List.nil<Principal>(); //empty list of Principal ID
            case (?result) result;
         };
         currentOwnerNFTs := List.filter(
            currentOwnerNFTs,
            func(listedForSaleItemID : Principal) : Bool {
               return listedForSaleItemID != soldItemID;
               //listed for sale item is listed and sold then removed because this NFT no longer belongs to the original owner.
               //listed for sale item is listed and NOT sold then add to the current owner's list of NFT
            },
         );

         addToOwnershipMap(newOwnerID, soldItemID); //add ownership from sold item to new owner who bought this NFT.
         return "Success";
      } else {
         return transferOwnershipToBuyer;
      }

   };

};
