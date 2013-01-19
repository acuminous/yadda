var hospital;
var ward;
var patient;
var bed;

var patient_lib = new Yadda.Library.English()
    .given('that $name is a $gender, $speciality patient at $hospital hospital', function(patient_name, gender, speciality, hospital_name) {
        hospital = hospital ? hospital : new Hospital(hospital_name);
        patient = hospital.admit(new Patient(patient_name));
        patient.gender = gender;
        patient.speciality = speciality;
        she = he = patient;
    })
    .given('that $ward ward is a $speciality ward in $hospital hospital', function(ward_name, speciality, hospital_name) {
        hospital = hospital ? hospital : new Hospital(hospital_name);
        ward = hospital.is_ward(ward_name) ? hospital.get_ward(ward_name) : hospital.add_ward(new Ward(ward_name));
        ward.speciality = speciality;
    })
    .given('that bed $number is a $gender bed in $ward ward', function(number, gender, ward_name) {
        bed = ward.get_bed(number) ? ward.get_bed(number) : ward.add_bed(new Bed(ward, number));
        bed.gender = gender;
    })
    .when('$name is admitted to bed $number', function(name, number) {
        name.match(/he|she/) ? patient : hospital.get_patient(name);
        bed = hospital.get_bed(number);
        bed.admit(patient);
    })
    .then('$name is marked as $template template', function(name, template) {
        patient = name.match(/he|she/) ? patient : hospital.get_patient(name);
        equal(patient.template, template)
    });

var Patient = function(full_name) {
    this.first_name = full_name.split(' ')[0];
    this.last_name = full_name.split(' ')[1];
    this.full_name = full_name;
    this.gender;
    this.speciality;
    this.template;
}

var Hospital = function(name) {
    this.name = name
    this.patients = {};
    this.wards = {};

    this.add_ward = function(ward) {
        this.wards[ward.name] = ward;
        return ward;
    }

    this.is_ward = function(name) {
        return this.get_ward(name) != undefined;
    }

    this.admit = function(patient) {
        this.patients[patient.first_name] = patient;
        this.patients[patient.full_name] = patient;
        return patient;
    }

    this.is_admitted = function(name) {
        return this.get_patient(name) != undefined;
    }

    this.get_patient = function(name) {
        return this.patients[name];
    }

    this.get_ward = function(name) {
        return this.wards[name];
    }    

    this.get_bed = function(number) {
        var bed;
        for (ward in this.wards) {
            bed = this.wards[ward].get_bed(number);
            if (bed) break;
        }
        return bed;
    }
}

var Ward = function(name) {
    this.name = name;
    this.speciality;
    this.beds = {};

    this.get_bed = function(number) {
        return this.beds[number];
    }

    this.add_bed = function(bed) {
        return this.beds[bed.number] = bed;
    }
}

var Bed = function(ward, number) {
    this.ward = ward;
    this.number = number;
    this.gender;
    this.patient;

    this.admit = function(patient) {
        this.patient = patient;
        this.patient.template = (this.patient.speciality == this.ward.speciality) ? 'on' : 'off';
    }
}

var yadda = new Yadda.yadda(patient_lib)
    .before(function() {
        hospital = ward = bed = patient = null;
    }
);

test('Admit an on template patient', function() {
    yadda.yadda([
        'Given that Bob Holness is a male, cardiovascular patient at Heathroad hospital',
        'and that Holbrook ward is a cardiovascular ward in Heathroad hospital',
        'and that bed 209 is a male bed in Holbrook ward',
        'when Bob is admitted to bed 209',
        'then he is marked as on template'
    ]);
});

test('Admit an off template patient', function() {
    yadda.yadda([
        'Given that Bob Holness is a male, cardiovascular patient at Heathroad hospital',
        'and that Bucklesham ward is a respiratory ward in Heathroad hospital',
        'and that bed 209 is a male bed in Bucklesham ward',
        'when Bob is admitted to bed 209',
        'then he is marked as off template'
    ]);
});