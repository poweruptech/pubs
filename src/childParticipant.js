/**
 * @class ChildParticipant
 */
function ChildParticipant(){
	this.key = 0;
	this.data = {
		firstName: '',
		lastName: '',
		gender: 'unknown',
		dateOfBirth: '',
		customFields: []
		
	};

	this.status = {
		errors: [],
		fail: true
	};
	
	this.categoryIndex;
	
	this.personId = 'PUNKNOWN';
}

ChildParticipant.prototype = {
	/**
	 * Validates Child's information on form submission.
	 * @memberof ChildParticipant
	 * @function validate
	 */
	validate: function(){
		this.status.errors = [];
		let err = this.status.errors;

		switch(0){
			case this.data.firstName.length:
				err.push("First Name is required");
			case this.data.lastName.length:
				err.push("Last Name is required");
			case this.data.dateOfBirth.length:
				err.push("Date of Birth is required");
		}

		if(!err.length)
			this.status.fail = false;
		else
			this.status.fail = true;
	}
}

export { ChildParticipant };