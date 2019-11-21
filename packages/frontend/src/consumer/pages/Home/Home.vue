<template lang='pug'>
  .page-container
    dashboard-info
    dashboard-chart(:paymentsStream='$paymentsStream')
    dashboard-tables
</template>
