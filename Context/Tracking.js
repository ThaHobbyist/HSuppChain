import React, { useState, useEffect } from "react";
import Web3Modal from "web3modal";
import { ethers } from "ethers";

// Internal Imports
import tracking from "../Context/Tracking.json";
const ContractAddress = "0x5fbdb2315678afecb367f032d93f642f64180aa3";
const ContractABI = tracking.abi;

//--Fetching the Smart Contract

const fetchContract = (signerOrProvider) =>
	new ethers.Contract(ContractAddress, ContractABI, signerOrProvider);

export const TrackingContext = React.createContext();

export const TrackingProvider = ({ children }) => {
	//State Variables
	const DappName = "HTrack";
	const [currentUser, setCurrentUser] = useState("");

	const createShipment = async (items) => {
		console.log(items);
		const { reciever, pickupTime, distance, cost } = items;

		try {
			const Web3Modal = new Web3Modal();
			const connection = await Web3Modal.connect();
			const provider = new ethers.providers.Web3Provider(connection);
			const signer = provider.getSigner();
			const contract = fetchContract(signer);
			const createItem = await contract.createShipment(
				reciever,
				new Date(pickupTime).getTime(),
				distance,
				ethers.utils.parseUnits(cost, 18),
				{
					value: ethers.utils.parseUnits(cost, 18),
				}
			);
			await createItem.wait();
			console.log(createItem);
		} catch (error) {
			console.log("Something went wrong in createShipment", error);
		}
	};

	const getAllShipments = async () => {
		try {
			const provider = new ethers.providers.JsonRpcProvider();
			const contract = fetchContract(provider);

			const shipments = await contract.getAllTransactions();
			const allShipments = shipments.map((shipment) => ({
				sender: shipment.sender,
				recipient: shipment.recipient,
				cost: ethers.utils.formatEther(shipment.cost.toString()),
				pickupTime: shipment.pickupTime.toNumber(),
				deliveryTime: shipment.deliveryTime.toNumber(),
				distance: shipment.distance.toNumber(),
				isPaid: shipment.isPaid,
				status: shipment.status,
			}));

			return allShipments;
		} catch (error) {
			console.log("Something went wrong in getting Shipment", error);
		}
	};

	const getShipmentCount = async () => {
		try {
			if (!window.ethereum) return "Install metamask extension!!";

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});
			const provider = new ethers.providers.JsonRpcProvider();
			const contract = fetchContract(provider);
			const shipmentsCount = await contract.getShipmentCount(accounts[0]);
			return shipmentsCount.toNumber();
		} catch (error) {
			console.log(
				"Something went wrong in getting Shipment Count",
				error
			);
		}
	};

	const completeShipment = async (completeShipment) => {
		console.log(completeShipment);

		const { reciever, index } = completeShipment;
		try {
			if (!window.ethereum) return "Install metamask extension!!";

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});
			const Web3Modal = new Web3Modal();
			const connection = await Web3Modal.connect();
			const provider = new ethers.providers.Web3Provider(connection);
			const signer = provider.getSigner();
			const contract = fetchContract(signer);

			const transaction = await contract.completeShipment(
				accounts[0],
				recipient,
				index,
				{
					gasLimit: 300000,
				}
			);

			transaction.wait();
			console.log(transaction);
		} catch (error) {
			console.log("Something went wrong in completing Shipment", error);
		}
	};

	const getShipment = async (index) => {
		try {
			if (!window.ethereum) return "Install metamask extension!!";

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});
			const provider = new ethers.providers.JsonRpcProvider();
			const contract = fetchContract(provider);

			const shipment = await contract.getShipment(accounts[0], index * 1);

			const singleShipment = {
				sender: shipment[0],
				reciever: shipment[1],
				pickupTime: shipment[2].toNumber(),
				deliveryTime: shipment[3].toNumber(),
				distance: shipment[4].toNumber(),
				cost: ethers.utils.formatEther(shipment[5].toString()),
				status: shipment[6],
				isPaid: shipment[7],
			};

			return singleShipment;
		} catch (error) {
			console.log("Something went wrong in getting Shipment", error);
		}
	};

	const startShipment = async (getProduct) => {
		const { recipient, index } = getProduct;

		try {
			if (!window.ethereum) return "Install metamask extension!!";

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});
			const Web3Modal = new Web3Modal();
			const connection = await Web3Modal.connect();
			const provider = new ethers.providers.Web3Provider(connection);
			const signer = provider.getSigner();
			const contract = fetchContract(signer);

			const shipment = await contract.startShipment(
				accounts[0],
				recipient,
				index * 1
			);

			shipment.wait();

			console.log(shipment);
		} catch (error) {
			console.log("Something went wrong in starting Shipment", error);
		}
	};

	//--Check Wallet Connection
	const checkIfWalletConnected = async () => {
		try {
			if (!window.ethereum) return "Install metamask extension!!";

			const accounts = await window.ethereum.request({
				method: "eth_accounts",
			});

			if (accounts.length) {
				setCurrentUser(accounts[0]);
			} else {
				return "No Account";
			}
		} catch (error) {
			console.log(
				"Something went wrong in checking Wallet Connection",
				error
			);
		}
	};

	//--Connect Wallet
	const connectWallet = async () => {
		try {
			if (!window.ethereum) return "Install metamask extension!!";

			const accounts = await window.ethereum.request({
				method: "eth_requestAccounts",
			});

			setCurrentUser(accounts[0]);
		} catch (error) {
			console.log("Something went wrong in connecting Wallet", error);
		}
	};

	useEffect(() => {
		checkIfWalletConnected();
	}, []);

	return (
		<TrackingContext.Provider
			value={{
				connectWallet,
				createShipment,
				getAllShipments,
				completeShipment,
				getShipment,
				getShipmentCount,
				startShipment,
				DappName,
				currentUser,
			}}
		>
			{children}
		</TrackingContext.Provider>
	);
};
