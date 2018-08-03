function ChildParticipant(){
	this.key = 0;
	this.data = {
		firstName: '',
		lastName: '',
		gender: 'unknown',
		dateOfBirth: '',
		customFields: []
		
	};
	
	this.categoryIndex;
	
	this.personId = 'PUNKNOWN';
}

export { ChildParticipant };