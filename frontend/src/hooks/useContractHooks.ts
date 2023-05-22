import { useState, useEffect } from "react";
import { useContractCall, useContractFunction, TransactionStatus } from "@usedapp/core";
import { Interface } from "@ethersproject/abi";
import { Contract } from "@ethersproject/contracts";
import { BigNumber } from "@ethersproject/bignumber";

//import { abi } from "../Parking.json";
import { Zone } from "../constants";

const CONTRACT_ADDRESS = process.env.REACT_APP_CONTRACT_ADDRESS || "0x58Cf793Bd107dCC6a1f9755895E8F15e6c09bF9D";

const contractInterface = new Interface([
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "plate",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "numOfMinutes",
				"type": "uint256"
			},
			{
				"internalType": "enum Parking.ParkingZone",
				"name": "zone",
				"type": "uint8"
			}
		],
		"name": "buyTicket",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "plate",
				"type": "string"
			}
		],
		"name": "cancelTicket",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"internalType": "enum Parking.ParkingZone",
				"name": "zone",
				"type": "uint8"
			}
		],
		"name": "changeZonePrice",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "plate",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "numOfMinutes",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum Parking.ParkingZone",
				"name": "zone",
				"type": "uint8"
			}
		],
		"name": "LogTicketBought",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "plate",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "balanceLeft",
				"type": "uint256"
			}
		],
		"name": "LogTicketCanceled",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "plate",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "numOfMinutes",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum Parking.ParkingZone",
				"name": "zone",
				"type": "uint8"
			}
		],
		"name": "LogTicketRenewed",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "string",
				"name": "oldPlate",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "newPlate",
				"type": "string"
			}
		],
		"name": "LogTicketTransfered",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "price",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "enum Parking.ParkingZone",
				"name": "zone",
				"type": "uint8"
			}
		],
		"name": "LogZonePriceChanged",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "address",
				"name": "previousOwner",
				"type": "address"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "OwnershipTransferred",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "pause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Paused",
		"type": "event"
	},
	{
		"inputs": [],
		"name": "renounceOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferOwnership",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "oldPlate",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "newPlate",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "newOwner",
				"type": "address"
			}
		],
		"name": "transferTicket",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "unpause",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "account",
				"type": "address"
			}
		],
		"name": "Unpaused",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "value",
				"type": "uint256"
			}
		],
		"name": "withdraw",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "plate",
				"type": "string"
			}
		],
		"name": "getTicket",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			},
			{
				"internalType": "enum Parking.ParkingZone",
				"name": "",
				"type": "uint8"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "plate",
				"type": "string"
			},
			{
				"internalType": "enum Parking.ParkingZone",
				"name": "zone",
				"type": "uint8"
			}
		],
		"name": "isTicketValid",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "paused",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "enum Parking.ParkingZone",
				"name": "",
				"type": "uint8"
			}
		],
		"name": "zonePricePerMinute",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
]);
const contract = new Contract("0x58Cf793Bd107dCC6a1f9755895E8F15e6c09bF9D", contractInterface);

const useContractFetch = (method: string, args: any[] = []) =>
  useContractCall({ abi: contractInterface, address: CONTRACT_ADDRESS, args, method }) || [];

const useContract = (method: string, options: object = {}) => useContractFunction(contract, method, options);

export const useGetOwner = (): string | undefined => {
  const [owner] = useContractFetch("owner");
  return owner;
};

export const useGetZonePrice = (zone: Zone): BigNumber => {
  const [price] = useContractFetch("zonePricePerMinute", [zone]);
  return price || BigNumber.from(0);
};

export const useGetTicketInfo = (plate: string): { expiration: number; zone: Zone } => {
  const [expiration, zone] = useContractFetch("getTicket", [plate]);
  return { expiration: expiration ? expiration.toNumber() : undefined, zone };
};

type UseSetZonePrice = (price: BigNumber, zone: Zone) => Promise<void>;
type UseBuyTicket = (plate: string, duration: number, zone: Zone, value: { value: BigNumber }) => Promise<void>;
type UseCancelTicket = (plate: string) => Promise<void>;
type UseTransferTicket = (oldPlate: string, newPlate: string, newOwner: string) => Promise<void>;
type UseWithdrawType = (amount: BigNumber) => Promise<void>;

type Withdraw = "withdraw";
type BuyTicket = "buyTicket";
type CancelTicket = "cancelTicket";
type SetZonePrice = "changeZonePrice";
type TransferTicket = "transferTicket";
type TransactionTypes = Withdraw | BuyTicket | CancelTicket | SetZonePrice | TransferTicket;

type WithdrawOrBuy<T extends TransactionTypes> = T extends Withdraw
  ? UseWithdrawType
  : T extends BuyTicket
  ? UseBuyTicket
  : T extends SetZonePrice
  ? UseSetZonePrice
  : T extends TransferTicket
  ? UseTransferTicket
  : UseCancelTicket;

export const useCustomContractFunction = <T extends TransactionTypes>(
  method: T
): [TransactionStatus, () => void, WithdrawOrBuy<T>] => {
  const { state, send } = useContract(method);
  const [tx, setTx] = useState(state);

  useEffect(() => {
    setTx(state);
  }, [state]);

  return [tx, () => setTx({ status: "None" }), send];
};
