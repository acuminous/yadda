const { equal: eq } = require('node:assert');
const { Dictionary, ContextBoundLibrary, localisation } = require('../../lib/index');
const { English } = localisation;
const { Hospital, Patient, Ward, Bed } = require('./hospital');

module.exports.init = () => {
  let hospital, ward, patient, bed;
  const dictionary = new Dictionary()
    .define('gender', /(male|femail)/)
    .define('speciality', /(cardiovascular|respiratory)/)
    .define('x', /(a) (b)/);

  const library = English.localise(new ContextBoundLibrary(dictionary))

    .given('that $name is a $gender, $speciality patient at $hospital hospital', (patient_name, gender, speciality, hospital_name) => {
      hospital = hospital ? hospital : new Hospital(hospital_name);
      patient = hospital.admit(new Patient(patient_name));
      patient.gender = gender;
      patient.speciality = speciality;
    })
    .given('that $ward ward is a $speciality ward in $hospital hospital', (ward_name, speciality, hospital_name) => {
      hospital = hospital ? hospital : new Hospital(hospital_name);
      ward = hospital.is_ward(ward_name) ? hospital.get_ward(ward_name) : hospital.add_ward(new Ward(ward_name));
      ward.speciality = speciality;
    })
    .given('that bed $number is a $gender bed in $ward ward', (number, gender, _ward_name) => {
      bed = ward.get_bed(number) ? ward.get_bed(number) : ward.add_bed(new Bed(ward, number));
      bed.gender = gender;
    })
    .when('$name is admitted to bed $number', (name, number) => {
      name.match(/he|she/) ? patient : hospital.get_patient(name);
      bed = hospital.get_bed(number);
      bed.admit(patient);
    })
    .then('$name is marked as $template template', (name, template) => {
      patient = name.match(/he|she/) ? patient : hospital.get_patient(name);
      eq(patient.template, template);
    });

  return library;
};
