// const timeGetters = {
//   methods: {
//     getTime (prop, impKey, metKey) {
//     }
//   }
// }

// function getValue (prop, impKey, metKey, impUnit, metUnit) {
//   if (!prop) return

//   switch (this.units) {
//     case 'imp':
//       if (prop[impKey]) {
//         return math.round(math.unit(prop[impKey][0].v, 'degF').toNumber('degF'), 1)
//       } else if (prop[metKey]) {
//         return math.round(math.unit(prop[metKey][0].v, 'degC').toNumber('degF'), 1)
//       }
//       break
//     case 'met':
//       if (prop[metKey]) {
//         return math.round(math.unit(prop[metKey][0].v, 'degC').toNumber('degC'), 1)
//       } else if (prop[impKey]) {
//         return math.round(math.unit(prop[impKey][0].v, 'degF').toNumber('degC'), 1)
//       }
//       break
//   }
//   return
// }

// function valueGetters (impUnit, metUnit) {
//   return function (prop, impKey, metKey) {
//     return getValue(prop, impKey, metKey, impUnit, metUnit)
//   }
// }

// const valueGetters = {
//   methods: {
//     getValue (prop, impKey, metKey) {
//       if (!prop) return

//       switch (this.units) {
//         case 'imp':
//           if (prop[impKey]) {
//             return math.round(math.unit(prop[impKey][0].v, 'degF').toNumber('degF'), 1)
//           } else if (prop[metKey]) {
//             return math.round(math.unit(prop[metKey][0].v, 'degC').toNumber('degF'), 1)
//           }
//           break
//         case 'met':
//           if (prop[metKey]) {
//             return math.round(math.unit(prop[metKey][0].v, 'degC').toNumber('degC'), 1)
//           } else if (prop[impKey]) {
//             return math.round(math.unit(prop[impKey][0].v, 'degF').toNumber('degC'), 1)
//           }
//           break
//       }
//       return
//     }
//   }
// }

// export {
//   timeGetters,
//   valueGetters
// }
