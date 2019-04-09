var $base = "https://poweruptaservices.com/";

var URL = {
	$base: "https://poweruptaservices.com/",
	auth_cust: $base + "auth/cust",
	create_booking: $base + "create/booking",
	create_customer: $base + "create/customer",
	create_hold: $base + "create/hold",
	delete_hold: $base + "delete/hold",
	get_booking: $base + "get/booking",
	get_availability: $base + "get/classmeta",
	get_classes: $base + "get/classes",
	get_class_meta: $base + "get/classmeta",
	get_customers: $base + "get/customers",
	test_url: $base + "test"
};

Object.freeze(URL);

export { URL };