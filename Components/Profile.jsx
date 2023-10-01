import React, { useState, useEffect } from "react";
import Image from "next/image";

//Internal imports
import images from "../Images/index";
import { Str1 } from "../Components/index";

export default ({
	openProfile,
	setOpenProfile,
	currentUser,
	getShipmentCount,
}) => {
	const [count, setCount] = useState();
	useEffect(() => {
		const getShipmentsData = getShipmentCount();

		return async () => {
			const allData = await getShipmentsData;
			setCount(allData);
		};
	}, []);

  return openProfile ? (
		<div className="fixed inset-0 z-10 overflow-y-auto">
			<div
				className="fixed inset-0 w-full bg-black opacity-40"
				onClick={() => setOpenProfile(false)}
			></div>
			<div className="flex items-center min-h-screen px-4 py-8">
				<div className="relative w-full max-w-lg p-4 mx-auto bg-white rounded-md shadow-lg ">
					<div className="flex justify-end">
						<button
							className="p-2 text-gray-400 rounded-md hover-bd-gray-100"
							onClick={() => setOpenProfile(false)}
						>
							<Str1 />
						</button>
					</div>
					<div className="max-w-sm mx-auto py-3 space-y-3 text-center">
						<Image
							src={images.avatar}
							className="w-24 h-24 md-3 rounded-full shadow-lg"
							alt="Bonnie Image"
						/>
						<h5 className="mb-1 text-xl font-medium text-gray-900 dark:text-white">
							Wlcome Trader
						</h5>

						<span className="text-sm text-gray-500 dark:text-gray-400">
							{currentUser}
						</span>

						<div className="flex mt-4 space-x-3 md:mt-6">
							<a
								href="#"
								className="inline-flex items-center px-4 py-2 text-sm text-center text-black rounded-lg border-2"
							>
								Balance: 50 ETH
							</a>
							<a
								href="#"
								className="inline-flex items-center px-4 py-2 text-sm text-center text-black rounded-lg border-2"
							>
								Total shipments: {count ? count : 0}
							</a>
						</div>
					</div>
				</div>
			</div>
		</div>
  ) : (
		""
  );
};
