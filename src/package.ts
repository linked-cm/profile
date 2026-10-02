import {linkedPackage} from '@_linked/core/utils/Package';
import {createLinkedComponentFn} from '@_linked/react/utils/LinkedComponent';

const {
  linkedShape,
  linkedUtil,
  linkedOntology,
  registerPackageExport,
  registerPackageModule,
  packageExports,
  packageName,
  getPackageShape,
  packageMetadata,
} = linkedPackage('@linked.cm/profile');

// Components use the same package export registry as shapes and ontologies.
// Keep this factory here so package authors have one registration entry point.
const linkedComponent = createLinkedComponentFn(registerPackageExport, () => {});

export {
  linkedComponent,
  linkedShape,
  linkedUtil,
  linkedOntology,
  registerPackageExport,
  registerPackageModule,
  packageExports,
  packageName,
  getPackageShape,
  packageMetadata,
};
