
import {ITxDetail} from "../interfaces"

import Gas from './Gas'

const explore = (txDetails: Array<ITxDetail>) => {

  // run each probe on all txs, return all results

  return Gas(txDetails)
}

const Default = {
  explore
}

export default Default
