import Debug "mo:base/Debug";
import Principal "mo:base/Principal";

actor class NFT(name : Text, owner : Principal, content : [Nat8]) = this {
    Debug.print("it works!! One NFT Minted");

    private let itemName = name;
    private var nftOwner = owner;
    private let imageByte = content;

    public query func getName() : async Text {
        return itemName;
    };

    public query func getOwner() : async Principal {
        return nftOwner;
    };

    public query func getAsset() : async [Nat8] {
        return imageByte;
    };

    public query func getCanisterID() : async Principal {
        return Principal.fromActor(this);
    };

    public shared (msg) func transferOwnership(newOwner : Principal) : async Text {
        // TODO: This function helps transfer NFT that is going to sell to OpenD Homepage
        if (msg.caller == nftOwner) {
            nftOwner := newOwner;
            return "Success";
        } else {
            //else this is not the owner of this NFT
            return "Error: Not Initiated by NFT owner.";
        }

    };
};
