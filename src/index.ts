import codegen from 'codegen.macro'
import './styles.css'

codegen`module.exports = require('@kentcdodds/react-workshop-app/codegen')({
  options: {concurrentMode: true}
})`
