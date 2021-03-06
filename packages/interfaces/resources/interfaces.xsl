<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" encoding="Windows-1252"/>

    <xsl:template match="/" >
// Autogenerated file
import { BigNumber } from 'bignumber.js'
import { ILightMeterConfiguration } from './ILightMeterConfiguration'

enum ConnectionKind {
<xsl:for-each select="/meters/meter"><xsl:choose><xsl:when test="position() != 1"><xsl:text>
  </xsl:text></xsl:when>
<xsl:otherwise><xsl:text>  </xsl:text></xsl:otherwise></xsl:choose><xsl:value-of select="./@name"/> = '<xsl:value-of select="./@configname"/>'<xsl:if test="position() &lt; last()">,</xsl:if></xsl:for-each>
}
<xsl:for-each select="/meters/meter">
interface IMeterConfiguration<xsl:value-of select="./@name"/> extends ILightMeterConfiguration {
  kind: ConnectionKind.<xsl:value-of select="./@name"/><xsl:for-each select="./parameter"><xsl:text>
  </xsl:text><xsl:value-of select="./@name"/><xsl:if test="./@optional='true'">?</xsl:if>: <xsl:value-of select="./@type"/>
    </xsl:for-each>
}
</xsl:for-each>
type IMeterConfiguration = <xsl:for-each select="/meters/meter">IMeterConfiguration<xsl:value-of select="./@name"/><xsl:if test="position() &lt; last()"> |
                           </xsl:if></xsl:for-each>

export { IMeterConfiguration,
         ConnectionKind,
         <xsl:for-each select="/meters/meter">IMeterConfiguration<xsl:value-of select="./@name"/><xsl:if test="position() &lt; last()">,
         </xsl:if></xsl:for-each>
       }

export * from './ILightMeterConfiguration'
</xsl:template>
</xsl:stylesheet>
