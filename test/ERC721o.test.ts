const { ethers } = require("hardhat");

const { deployContract } = require("./helpers.ts");
const { expect } = require("chai");
//const { deployContract } = require();
//import { deployContract } from "./helpers";
//import { expect } from "chai";
import { ERC721oMock as ERC721oMockType } from "../typechain/index";

const {
  constants: { ZERO_ADDRESS },
} = require("@openzeppelin/test-helpers");

const RECEIVER_MAGIC_VALUE = "0x150b7a02";
const GAS_MAGIC_VALUE = 20000;

const createTestSuite = ({
  contract,
  constructorArgs,
}: {
  contract: string;
  constructorArgs: Array<any>;
}) =>
  function () {
    context(`${contract}`, function () {
      beforeEach(async function () {
        this.erc721o = (await deployContract(
          contract,
          constructorArgs
        )) as ERC721oMockType;
        this.startTokenId = this.erc721o.startTokenId
          ? (await this.erc721o.startTokenId()).toNumber()
          : 0;
        this.receiver = await deployContract("ERC721ReceiverMock", [
          RECEIVER_MAGIC_VALUE,
        ]);

        // Creating category with id 1 with 100 elements inside
        await this.erc721o["createCategory(uint256)"](100);
        // Creating category with id 2 with 3 elements inside
        await this.erc721o["createCategory(uint256)"](3);
      });

      describe("EIP-165 support", async function () {
        it("supports IERC721", async function () {
          expect(await this.erc721o.supportsInterface("0x80ac58cd")).to.eq(
            true
          );
        });

        it("supports ERC721Metadata", async function () {
          expect(await this.erc721o.supportsInterface("0x5b5e139f")).to.eq(
            true
          );
        });

        it("does not support ERC721Enumerable", async function () {
          expect(await this.erc721o.supportsInterface("0x780e9d63")).to.eq(
            false
          );
        });

        it("does not support random interface", async function () {
          expect(await this.erc721o.supportsInterface("0x00000042")).to.eq(
            false
          );
        });
      });

      context("with no minted tokens", async function () {
        it("has 0 totalSupply", async function () {
          const supply = await this.erc721o.totalSupply();
          expect(supply).to.equal(0);
        });

        it("has 0 totalMinted", async function () {
          const totalMinted = await this.erc721o.totalMinted();
          expect(totalMinted).to.equal(0);
        });
      });

      context("with minted tokens", async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2, addr3, addr4, addr5] =
            await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
          this.addr3 = addr3;
          this.addr4 = addr4;
          this.addr5 = addr5;

          // Minting 6 tokens from the 100 available tokens in category 1
          await this.erc721o["safeMint(address,uint256,uint256)"](
            addr1.address,
            1,
            1
          );
          await this.erc721o["safeMint(address,uint256,uint256)"](
            addr2.address,
            2,
            1
          );
          await this.erc721o["safeMint(address,uint256,uint256)"](
            addr3.address,
            3,
            1
          );

          // Minting the 3 available tokens in token category 2
          await this.erc721o["safeMint(address,uint256,uint256)"](
            addr4.address,
            2,
            2
          );
          await this.erc721o["safeMint(address,uint256,uint256)"](
            addr5.address,
            1,
            2
          );
        });

        describe("ERC721Metadata support", async function () {
          it("responds with the right name", async function () {
            expect(await this.erc721o.name()).to.eq("Bitmon");
          });

          it("responds with the right symbol", async function () {
            expect(await this.erc721o.symbol()).to.eq("BTMN");
          });

          describe("tokenURI", async function () {
            it("sends an empty uri by default", async function () {
              const uri = await this.erc721o.tokenURI(1);
              expect(uri).to.eq("");
            });

            it("reverts when tokenId is invalid", async function () {
              await expect(this.erc721o.tokenURI(42)).to.be.reverted;
            });
          });
        });

        describe("exists", async function () {
          it("verifies valid tokens", async function () {
            for (
              let tokenId = this.startTokenId;
              tokenId < 6 + this.startTokenId;
              tokenId++
            ) {
              const exists = await this.erc721o["exists(uint256)"](tokenId);
              expect(exists).to.be.true;
            }
          });

          it("verifies invalid tokens", async function () {
            // tokenId 7 should give false in exists function because there's just 6 minted tokens
            expect(
              await this.erc721o["exists(uint256)"](6 + this.startTokenId)
            ).to.be.false;
          });
        });

        describe("balanceOf", async function () {
          it("returns the amount for a given address", async function () {
            expect(await this.erc721o.balanceOf(this.owner.address)).to.equal(
              "0"
            );
            expect(await this.erc721o.balanceOf(this.addr1.address)).to.equal(
              "1"
            );
            expect(await this.erc721o.balanceOf(this.addr2.address)).to.equal(
              "2"
            );
            expect(await this.erc721o.balanceOf(this.addr3.address)).to.equal(
              "3"
            );
            expect(await this.erc721o.balanceOf(this.addr4.address)).to.equal(
              "2"
            );
            expect(await this.erc721o.balanceOf(this.addr5.address)).to.equal(
              "1"
            );
          });

          it("throws an exception for the 0 address", async function () {
            await expect(
              this.erc721o.balanceOf(ZERO_ADDRESS)
            ).to.be.revertedWith("BalanceQueryForZeroAddress");
          });
        });

        describe("_numberMinted", async function () {
          it("returns the amount for a given address", async function () {
            expect(
              await this.erc721o.numberMinted(this.owner.address)
            ).to.equal("0");
            expect(
              await this.erc721o.numberMinted(this.addr1.address)
            ).to.equal("1");
            expect(
              await this.erc721o.numberMinted(this.addr2.address)
            ).to.equal("2");
            expect(
              await this.erc721o.numberMinted(this.addr3.address)
            ).to.equal("3");
            expect(
              await this.erc721o.numberMinted(this.addr4.address)
            ).to.equal("2");
            expect(
              await this.erc721o.numberMinted(this.addr5.address)
            ).to.equal("1");
          });
        });

        context("_totalMinted", async function () {
          it("has 9 totalMinted", async function () {
            const totalMinted = await this.erc721o.totalMinted();
            expect(totalMinted).to.equal("9");
          });
        });

        describe("aux", async function () {
          it("get and set works correctly", async function () {
            const uint64Max = "18446744073709551615";
            expect(await this.erc721o.getAux(this.owner.address)).to.equal("0");
            await this.erc721o.setAux(this.owner.address, uint64Max);
            expect(await this.erc721o.getAux(this.owner.address)).to.equal(
              uint64Max
            );

            expect(await this.erc721o.getAux(this.addr1.address)).to.equal("0");
            await this.erc721o.setAux(this.addr1.address, "1");
            expect(await this.erc721o.getAux(this.addr1.address)).to.equal("1");

            await this.erc721o.setAux(this.addr3.address, "5");
            expect(await this.erc721o.getAux(this.addr3.address)).to.equal("5");

            expect(await this.erc721o.getAux(this.addr1.address)).to.equal("1");
          });
        });

        describe("ownerOf", async function () {
          it("returns the right owner", async function () {
            expect(await this.erc721o.ownerOf(0 + this.startTokenId)).to.equal(
              this.addr1.address
            );
            expect(await this.erc721o.ownerOf(1 + this.startTokenId)).to.equal(
              this.addr2.address
            );
            expect(await this.erc721o.ownerOf(2 + this.startTokenId)).to.equal(
              this.addr2.address
            );
            expect(await this.erc721o.ownerOf(3 + this.startTokenId)).to.equal(
              this.addr3.address
            );
            expect(await this.erc721o.ownerOf(4 + this.startTokenId)).to.equal(
              this.addr3.address
            );
            expect(await this.erc721o.ownerOf(5 + this.startTokenId)).to.equal(
              this.addr3.address
            );
            expect(
              await this.erc721o.ownerOf(100 + this.startTokenId)
            ).to.equal(this.addr4.address);
            expect(
              await this.erc721o.ownerOf(101 + this.startTokenId)
            ).to.equal(this.addr4.address);
            expect(
              await this.erc721o.ownerOf(102 + this.startTokenId)
            ).to.equal(this.addr5.address);
          });

          it("reverts for an invalid token", async function () {
            await expect(
              this.erc721o.ownerOf(6 + this.startTokenId)
            ).to.be.revertedWith("OwnerQueryForNonexistentToken");
            await expect(
              this.erc721o.ownerOf(103 + this.startTokenId)
            ).to.be.revertedWith("OwnerQueryForNonexistentToken");
          });
        });

        describe("approve", async function () {
          beforeEach(function () {
            this.tokenId = this.startTokenId;
            this.tokenId2 = this.startTokenId + 1;
          });

          it("sets approval for the target address", async function () {
            await this.erc721o
              .connect(this.addr1)
              .approve(this.addr2.address, this.tokenId);
            const approval = await this.erc721o.getApproved(this.tokenId);
            expect(approval).to.equal(this.addr2.address);
          });

          it("rejects an invalid token owner", async function () {
            await expect(
              this.erc721o
                .connect(this.addr1)
                .approve(this.addr2.address, this.tokenId2)
            ).to.be.revertedWith("ApprovalToCurrentOwner");
          });

          it("rejects an unapproved caller", async function () {
            await expect(
              this.erc721o.approve(this.addr2.address, this.tokenId)
            ).to.be.revertedWith("ApprovalCallerNotOwnerNorApproved");
          });

          it("does not get approved for invalid tokens", async function () {
            await expect(this.erc721o.getApproved(10)).to.be.revertedWith(
              "ApprovalQueryForNonexistentToken"
            );
          });
        });

        describe("setApprovalForAll", async function () {
          it("sets approval for all properly", async function () {
            const approvalTx = await this.erc721o.setApprovalForAll(
              this.addr1.address,
              true
            );
            await expect(approvalTx)
              .to.emit(this.erc721o, "ApprovalForAll")
              .withArgs(this.owner.address, this.addr1.address, true);
            expect(
              await this.erc721o.isApprovedForAll(
                this.owner.address,
                this.addr1.address
              )
            ).to.be.true;
          });

          it("sets rejects approvals for non msg senders", async function () {
            await expect(
              this.erc721o
                .connect(this.addr1)
                .setApprovalForAll(this.addr1.address, true)
            ).to.be.revertedWith("ApproveToCaller");
          });
        });

        context("test transfer functionality", function () {
          const testSuccessfulTransfer = function (transferFn: any) {
            beforeEach(async function () {
              this.tokenId = this.startTokenId + 1;

              const sender = this.addr2;
              this.from = sender.address;
              this.to = this.receiver.address;
              await this.erc721o
                .connect(sender)
                .setApprovalForAll(this.to, true);
              this.transferTx = await this.erc721o
                .connect(sender)
                [transferFn](this.from, this.to, this.tokenId);
            });

            it("transfers the ownership of the given token ID to the given address", async function () {
              expect(await this.erc721o.ownerOf(this.tokenId)).to.be.equal(
                this.to
              );
            });

            it("emits a Transfer event", async function () {
              await expect(this.transferTx)
                .to.emit(this.erc721o, "Transfer")
                .withArgs(this.from, this.to, this.tokenId);
            });

            it("clears the approval for the token ID", async function () {
              expect(await this.erc721o.getApproved(this.tokenId)).to.be.equal(
                ZERO_ADDRESS
              );
            });

            it("emits an Approval event", async function () {
              await expect(this.transferTx)
                .to.emit(this.erc721o, "Approval")
                .withArgs(this.from, ZERO_ADDRESS, this.tokenId);
            });

            it("adjusts owners balances", async function () {
              expect(await this.erc721o.balanceOf(this.from)).to.be.equal(1);
            });
          };

          const testUnsuccessfulTransfer = function (transferFn: any) {
            beforeEach(function () {
              this.tokenId = this.startTokenId + 1;
            });

            it("rejects unapproved transfer", async function () {
              await expect(
                this.erc721o
                  .connect(this.addr1)
                  [transferFn](
                    this.addr2.address,
                    this.addr1.address,
                    this.tokenId
                  )
              ).to.be.revertedWith("TransferCallerNotOwnerNorApproved");
            });

            it("rejects transfer from incorrect owner", async function () {
              await this.erc721o
                .connect(this.addr2)
                .setApprovalForAll(this.addr1.address, true);
              await expect(
                this.erc721o
                  .connect(this.addr1)
                  [transferFn](
                    this.addr3.address,
                    this.addr1.address,
                    this.tokenId
                  )
              ).to.be.revertedWith("TransferFromIncorrectOwner");
            });

            it("rejects transfer to zero address", async function () {
              await this.erc721o
                .connect(this.addr2)
                .setApprovalForAll(this.addr1.address, true);
              await expect(
                this.erc721o
                  .connect(this.addr1)
                  [transferFn](this.addr2.address, ZERO_ADDRESS, this.tokenId)
              ).to.be.revertedWith("TransferToZeroAddress");
            });
          };

          context("successful transfers", function () {
            describe("transferFrom", function () {
              testSuccessfulTransfer("transferFrom");
            });

            describe("safeTransferFrom", function () {
              testSuccessfulTransfer(
                "safeTransferFrom(address,address,uint256)"
              );

              it("validates ERC721Received", async function () {
                await expect(this.transferTx)
                  .to.emit(this.receiver, "Received")
                  .withArgs(
                    this.addr2.address,
                    this.addr2.address,
                    1 + this.startTokenId,
                    "0x",
                    GAS_MAGIC_VALUE
                  );
              });
            });
          });

          context("unsuccessful transfers", function () {
            describe("transferFrom", function () {
              testUnsuccessfulTransfer("transferFrom");
            });

            describe("safeTransferFrom", function () {
              testUnsuccessfulTransfer(
                "safeTransferFrom(address,address,uint256)"
              );
            });
          });
        });

        describe("_burn", async function () {
          beforeEach(function () {
            this.tokenIdToBurn = this.startTokenId;
          });

          it("can burn if approvalCheck is false", async function () {
            await this.erc721o
              .connect(this.addr2)
              .burn(this.tokenIdToBurn, false);
            expect(await this.erc721o.exists(this.tokenIdToBurn)).to.be.false;
          });

          it("revert if approvalCheck is true", async function () {
            await expect(
              this.erc721o.connect(this.addr2).burn(this.tokenIdToBurn, true)
            ).to.be.revertedWith("TransferCallerNotOwnerNorApproved");
          });
        });
      });

      context("mint", async function () {
        beforeEach(async function () {
          const [owner, addr1, addr2] = await ethers.getSigners();
          this.owner = owner;
          this.addr1 = addr1;
          this.addr2 = addr2;
        });

        describe("safeMint", function () {
          it("successfully mints a single token", async function () {
            const mintTx = await this.erc721o[
              "safeMint(address,uint256,uint256)"
            ](this.receiver.address, 1, 1);
            await expect(mintTx)
              .to.emit(this.erc721o, "Transfer")
              .withArgs(ZERO_ADDRESS, this.receiver.address, this.startTokenId);
            await expect(mintTx)
              .to.emit(this.receiver, "Received")
              .withArgs(
                this.owner.address,
                ZERO_ADDRESS,
                this.startTokenId,
                "0x",
                GAS_MAGIC_VALUE
              );
            expect(await this.erc721o.ownerOf(this.startTokenId)).to.equal(
              this.receiver.address
            );
          });

          it("successfully mints multiple tokens", async function () {
            const mintTx = await this.erc721o[
              "safeMint(address,uint256,uint256)"
            ](this.receiver.address, 5, 1);
            for (
              let tokenId = this.startTokenId;
              tokenId < 5 + this.startTokenId;
              tokenId++
            ) {
              await expect(mintTx)
                .to.emit(this.erc721o, "Transfer")
                .withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
              await expect(mintTx)
                .to.emit(this.receiver, "Received")
                .withArgs(
                  this.owner.address,
                  ZERO_ADDRESS,
                  tokenId,
                  "0x",
                  GAS_MAGIC_VALUE
                );
              expect(await this.erc721o.ownerOf(tokenId)).to.equal(
                this.receiver.address
              );
            }
          });

          it("rejects mints to the zero address", async function () {
            await expect(
              this.erc721o["safeMint(address,uint256,uint256)"](
                ZERO_ADDRESS,
                1,
                1
              )
            ).to.be.revertedWith("MintToZeroAddress");
          });

          it("requires quantity to be greater than 0", async function () {
            await expect(
              this.erc721o["safeMint(address,uint256,uint256)"](
                this.owner.address,
                0,
                1
              )
            ).to.be.revertedWith("MintZeroQuantity");
          });

          it("reverts for non-receivers", async function () {
            const nonReceiver = this.erc721o;
            await expect(
              this.erc721o["safeMint(address,uint256,uint256)"](
                nonReceiver.address,
                1,
                1
              )
            ).to.be.revertedWith("TransferToNonERC721ReceiverImplementer");
          });
        });

        describe("mint", function () {
          it("successfully mints a single token", async function () {
            const mintTx = await this.erc721o.mint(this.receiver.address, 1, 1);
            await expect(mintTx)
              .to.emit(this.erc721o, "Transfer")
              .withArgs(ZERO_ADDRESS, this.receiver.address, this.startTokenId);
            await expect(mintTx).to.not.emit(this.receiver, "Received");
            expect(await this.erc721o.ownerOf(this.startTokenId)).to.equal(
              this.receiver.address
            );
          });

          it("successfully mints multiple tokens", async function () {
            const mintTx = await this.erc721o.mint(this.receiver.address, 5, 1);
            for (
              let tokenId = this.startTokenId;
              tokenId < 5 + this.startTokenId;
              tokenId++
            ) {
              await expect(mintTx)
                .to.emit(this.erc721o, "Transfer")
                .withArgs(ZERO_ADDRESS, this.receiver.address, tokenId);
              await expect(mintTx).to.not.emit(this.receiver, "Received");
              expect(await this.erc721o.ownerOf(tokenId)).to.equal(
                this.receiver.address
              );
            }
          });

          it("does not revert for non-receivers", async function () {
            const nonReceiver = this.erc721o;
            await this.erc721o.mint(nonReceiver.address, 1, 1);
            expect(await this.erc721o.ownerOf(this.startTokenId)).to.equal(
              nonReceiver.address
            );
          });

          it("rejects mints to the zero address", async function () {
            await expect(
              this.erc721o.mint(ZERO_ADDRESS, 1, 1)
            ).to.be.revertedWith("MintToZeroAddress");
          });

          it("requires quantity to be greater than 0", async function () {
            await expect(
              this.erc721o.mint(this.owner.address, 0, 1)
            ).to.be.revertedWith("MintZeroQuantity");
          });
        });
      });
    });
  };

describe(
  "ERC721o",
  createTestSuite({
    contract: "ERC721oMock",
    constructorArgs: ["Bitmon", "BTMN"],
  })
);

describe(
  "ERC721o override _startTokenId()",
  createTestSuite({
    contract: "ERC721oStartTokenIdMock",
    constructorArgs: ["Bitmon", "BTMN", 1],
  })
);

describe(
  "ERC721o override _startTokenId()",
  createTestSuite({
    contract: "ERC721oStartTokenIdMock",
    constructorArgs: ["Bitmon", "BTMN", 133],
  })
);
