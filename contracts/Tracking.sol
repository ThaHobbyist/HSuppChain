// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Tracking {
    enum ShipmentStatus {
        PENDING,
        IN_TRANSIT,
        DELIVERED
    }

    struct Shipment {
        address sender;
        address recipient;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 cost;
        ShipmentStatus status;
        bool isPaid;
    }

    mapping(address => Shipment[]) public shipments;
    uint256 public shipmentCount;

    struct TypeShipment {
        address sender;
        address recipient;
        uint256 pickupTime;
        uint256 deliveryTime;
        uint256 distance;
        uint256 cost;
        ShipmentStatus status;
        bool isPaid;
    }

    TypeShipment[] typeShipments;

    event ShipmentCreated(
        address indexed sender,
        address indexed recipient,
        uint256 pickupTime,
        uint256 distance,
        uint256 cost
    );

    event ShipmentInTransit(
        address indexed sender,
        address indexed recipient,
        uint256 pickupTime
    );

    event ShipmentDelivered(
        address indexed sender,
        address indexed recipient,
        uint256 deliveryTime
    );

    event ShipmentPaid(
        address indexed sender,
        address indexed recipient,
        uint256 cost
    );

    constructor() {
        shipmentCount = 0;
    }

    function createShipment(
        address _recipient,
        uint256 _pickupTime,
        uint256 _distance,
        uint256 _cost
    ) public payable {
        require(msg.value == _cost, "Payment must be equal to cost");

        Shipment memory shipment = Shipment(
            msg.sender,
            _recipient,
            _pickupTime,
            0,
            _distance,
            _cost,
            ShipmentStatus.PENDING,
            false
        );

        shipments[msg.sender].push(shipment);
        shipmentCount++;

        typeShipments.push(
            TypeShipment(
                msg.sender,
                _recipient,
                _pickupTime,
                0,
                _distance,
                _cost,
                ShipmentStatus.PENDING,
                false
            )
        );
        emit ShipmentCreated(
            msg.sender,
            _recipient,
            _pickupTime,
            _distance,
            _cost
        );
    }

    function startShipment(
        address _sender,
        address _recipient,
        uint256 _index
    ) public {
        Shipment storage shipment = shipments[_sender][_index];
        TypeShipment storage typeShipment = typeShipments[_index];

        require(shipment.recipient == _recipient, "Invalid recipient");
        require(
            shipment.status == ShipmentStatus.PENDING,
            "Shipment already in transit"
        );

        shipment.status = ShipmentStatus.IN_TRANSIT;
        typeShipment.status = ShipmentStatus.IN_TRANSIT;

        emit ShipmentInTransit(_sender, _recipient, shipment.pickupTime);
    }

    function completeShipment(
        address _sender,
        address _recipient,
        uint256 _index
    ) public {
        Shipment storage shipment = shipments[_sender][_index];
        TypeShipment storage typeShipment = typeShipments[_index];

        require(shipment.recipient == _recipient, "Invalid recipient");
        require(
            shipment.status == ShipmentStatus.IN_TRANSIT,
            "Shipment not in transit"
        );
        require(shipment.isPaid == false, "Shipment already paid");

        shipment.status = ShipmentStatus.DELIVERED;
        typeShipment.status = ShipmentStatus.DELIVERED;

        typeShipment.deliveryTime = block.timestamp;
        shipment.deliveryTime = block.timestamp;

        uint256 amount = shipment.cost;

        payable(shipment.sender).transfer(amount);

        shipment.isPaid = true;
        typeShipment.isPaid = true;

        emit ShipmentDelivered(_sender, _recipient, shipment.deliveryTime);
        emit ShipmentPaid(_sender, _recipient, shipment.cost);
    }

    function getShipment(
        address _sender,
        uint256 _index
    )
        public
        view
        returns (
            address,
            address,
            uint256,
            uint256,
            uint256,
            uint256,
            ShipmentStatus,
            bool
        )
    {
        Shipment memory shipment = shipments[_sender][_index];

        return (
            shipment.sender,
            shipment.recipient,
            shipment.pickupTime,
            shipment.deliveryTime,
            shipment.distance,
            shipment.cost,
            shipment.status,
            shipment.isPaid
        );
    }

    function getShipmentsCount(address _sender) public view returns (uint256) {
        return shipments[_sender].length;
    }

    function getAllTransactions() public view returns (TypeShipment[] memory) {
        return typeShipments;
    }
}
