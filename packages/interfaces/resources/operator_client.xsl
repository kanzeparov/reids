<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" encoding="Windows-1252"/>

    <xsl:template match="/" >
// Autogenerated file
import { BigNumber } from 'bignumber.js'
import { Moment } from 'moment'
import { ErrorType } from '../errors'
import { IClient } from './interfaces'

export default interface IOperatorClient {<xsl:for-each select="/operator/events/event[not(@cansend) or @cansend!='false']">
  send<xsl:value-of select="./@name"/> (<xsl:for-each select="./param[not(@customrecerver)]"><xsl:value-of select="./@name"/><xsl:if test="./@optional='true'">?</xsl:if>: <xsl:value-of select="./@type"/><xsl:if test="position() != last()">, </xsl:if></xsl:for-each>): Promise&lt;void></xsl:for-each>
}
</xsl:template>
</xsl:stylesheet>