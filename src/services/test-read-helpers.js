import { getAllDebtGroups, getDebtGroupById } from './debt-groups.service.js';
import { getSubDebtsByGroupId, getActiveSubDebtsByGroupId } from './sub-debts.service.js';

const run = async () => {
  console.log('All debt groups:');
  console.table(await getAllDebtGroups());

  console.log('Debt group 1 (with sub-debts):');
  console.log(JSON.stringify(await getDebtGroupById(1), null, 2));

  console.log('Debt group 999 (should be null):');
  console.log(await getDebtGroupById(999));

  console.log('All sub-debts for group 1:');
  console.table(await getSubDebtsByGroupId(1));

  console.log('Active sub-debts for group 1 (should exclude Item A):');
  console.table(await getActiveSubDebtsByGroupId(1));

  process.exit(0);
};

run();