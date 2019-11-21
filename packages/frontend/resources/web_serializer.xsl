<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet
    version="1.0"
    xmlns:xsl="http://www.w3.org/1999/XSL/Transform">
    <xsl:output method="text" encoding="Windows-1252"/>

<xsl:template name="tokenize">
    <xsl:param name="text"/>
    <xsl:param name="separator" select="' | '"/>
    <xsl:choose>
        <xsl:when test="not(contains($text, $separator))"> else if (WebSerializer.is<xsl:value-of select="normalize-space($text)"/>(instance)) {
          return instance
        }</xsl:when>
        <xsl:otherwise> else if (WebSerializer.is<xsl:value-of select="normalize-space(substring-before($text, $separator))"/>(instance)) {
          return instance
        }<xsl:call-template name="tokenize">
                <xsl:with-param name="text" select="substring-after($text, $separator)"/>
            </xsl:call-template></xsl:otherwise>
    </xsl:choose>
</xsl:template>
<xsl:template name="AwaitHelper">
  <xsl:param name="value"/>
  <xsl:param name="allowAwait"/>
  <xsl:choose>
    <xsl:when test="$allowAwait='true'">await <xsl:value-of select="$value"/></xsl:when>
    <xsl:otherwise>let promise = <xsl:value-of select="$value"/>
        promises.push(promise)</xsl:otherwise>
  </xsl:choose>
</xsl:template>

<xsl:template name="TypeIn">
    <xsl:param name="type"/>
    <xsl:param name="value"/>
    <xsl:param name="originValue"/>
    <xsl:param name="allowAwait" select="'true'"/>
    <xsl:choose>
        <xsl:when test="$type='string'"><xsl:value-of select="$value"/></xsl:when>
        <xsl:when test="$type='boolean'"><xsl:value-of select="$value"/></xsl:when>
        <xsl:when test="$type='number'"><xsl:value-of select="$value"/></xsl:when>
        <xsl:when test="$type='WebRoomType'"><xsl:value-of select="$value"/></xsl:when>
        <xsl:when test="/web/enums/enum[@name=$type]"><xsl:value-of select="$value"/></xsl:when>
        <xsl:when test="$type='BigNumber'">new BigNumber(<xsl:value-of select="$value"/>)</xsl:when>
        <xsl:when test="$type='Moment'">moment(<xsl:value-of select="$value"/>).utc()</xsl:when>
        <xsl:when test="$type='IError'"><xsl:call-template name="AwaitHelper">
        <xsl:with-param name="allowAwait" select="$allowAwait"/>
        <xsl:with-param name="value">ErrorSerializer.deserializeError(<xsl:value-of select="$value"/>)</xsl:with-param></xsl:call-template></xsl:when>
        <xsl:when test="$type='IRoomRequest'"><xsl:call-template name="AwaitHelper">
            <xsl:with-param name="allowAwait" select="$allowAwait"/>
            <xsl:with-param name="value">WebSerializer.normalizeIRoomRequest(<xsl:value-of select="$value"/>)<xsl:if test="$allowAwait='false'">.then((obj) => {
          result.<xsl:value-of select='$originValue'/>[index] = obj
        })</xsl:if></xsl:with-param></xsl:call-template></xsl:when>
        <xsl:when test="starts-with($type, 'Array&lt;')"><xsl:value-of select="$value"/>.map((item: <xsl:value-of select="substring($type, 7, string-length($type) - 7)"/>, index: number) => {
        <xsl:call-template name="TypeIn">
        <xsl:with-param name="type" select="substring($type, 7, string-length($type) - 7)"/>
        <xsl:with-param name="value">item</xsl:with-param>
        <xsl:with-param name="allowAwait" select="'false'"/>
        <xsl:with-param name="originValue" select="$originValue"/>
      </xsl:call-template>
        return {} as <xsl:value-of select="substring($type, 7, string-length($type) - 7)"/>
      })</xsl:when>
        <xsl:otherwise><xsl:choose>
            <xsl:when test="contains($type, ' | ')">function (instance: any): <xsl:value-of select="$type"/> {
        if (!instance) {
          log.error('Unexpected undefined result!')
          return {} as <xsl:value-of select="substring-before($type, ' ')"/>
        }<xsl:call-template name="tokenize">
                <xsl:with-param name="text" select="$type"/>
            </xsl:call-template>
        log.error('Unexpected result!', instance)
        return {} as <xsl:value-of select="substring-before($type, ' ')"/>
      }(<xsl:call-template name="AwaitHelper">
      <xsl:with-param name="allowAwait" select="$allowAwait"/>
      <xsl:with-param name="value"><xsl:call-template name="AwaitHelper">
            <xsl:with-param name="allowAwait" select="$allowAwait"/>
            <xsl:with-param name="value">WebSerializer.normalize(<xsl:value-of select="$value"/>)</xsl:with-param></xsl:call-template>)</xsl:with-param></xsl:call-template></xsl:when>
            <xsl:otherwise><xsl:call-template name="AwaitHelper">
            <xsl:with-param name="allowAwait" select="$allowAwait"/>
            <xsl:with-param name="value">WebSerializer.normalize<xsl:value-of select="$type"/>(<xsl:value-of select="$value"/>)<xsl:if test="$allowAwait='false'">.then((obj) => {
          result.<xsl:value-of select='$originValue'/>[index] = obj
          return Promise.resolve()
        })</xsl:if></xsl:with-param></xsl:call-template></xsl:otherwise>
        </xsl:choose></xsl:otherwise>
    </xsl:choose>
</xsl:template>
    <xsl:template match="/" >
// Autogenerated file
import Logger from '@machinomy/logger'
const log = new Logger('onder-common-webserializer')
import BigNumber from 'bignumber.js'
import * as moment from 'moment'
import ErrorSerializer from './error_serializer'
import { WebMessageType,
         ModuleType,
         IRoomResponse,
         IRoomRequest,
         IEventResponse,
         IEventRequest,
         IError,
         IErrorResponse<xsl:for-each select="/web/interfaces/interface">,
         <xsl:value-of select="./@name"/></xsl:for-each><xsl:for-each select="/web/events/event">,
         I<xsl:value-of select="./@name"/>EventResponse,
         I<xsl:value-of select="./@name"/>EventRequest</xsl:for-each><xsl:for-each select="/web/rooms/room">,
         I<xsl:value-of select="./@name"/>RoomResponse,
         I<xsl:value-of select="./@name"/>RoomRequest</xsl:for-each> } from '@onder/interfaces'

export default class WebSerializer {
  private constructor () {
  }
  private static stringifyHelper (key: string, value: any): any {
    if (!(value instanceof Object)) {
      return value
    }
    if (value instanceof BigNumber) {
      return value.toNumber()
    }
    if (moment.isMoment(value)) {
      return value.valueOf()
    }
    Object.keys(value).forEach((k: string) => {
      if (value[k] instanceof BigNumber) {
        value[k] = value[k].toNumber()
      }
      if (moment.isMoment(value[k])) {
        value[k] = value[k].valueOf()
      }
    })
    return value
  }
  public static serialize (instance: IErrorResponse<xsl:for-each select="/web/interfaces/interface"> |
                                     <xsl:value-of select="./@name"/></xsl:for-each><xsl:for-each select="/web/events/event"> |
                                     I<xsl:value-of select="./@name"/>EventRequest |
                                     I<xsl:value-of select="./@name"/>EventResponse</xsl:for-each><xsl:for-each select="/web/rooms/room"> |
                                     I<xsl:value-of select="./@name"/>RoomRequest |
                                     I<xsl:value-of select="./@name"/>RoomResponse</xsl:for-each>): string {
    const obj = WebSerializer.normalize(instance)
    return JSON.stringify(obj, WebSerializer.stringifyHelper)
  }

  public static normalize (instance: any): Promise&lt;IErrorResponse<xsl:for-each select="/web/interfaces/interface"> |
                                                   <xsl:value-of select="./@name"/></xsl:for-each><xsl:for-each select="/web/events/event"> |
                                                   I<xsl:value-of select="./@name"/>EventRequest |
                                                   I<xsl:value-of select="./@name"/>EventResponse</xsl:for-each><xsl:for-each select="/web/rooms/room"> |
                                                   I<xsl:value-of select="./@name"/>RoomRequest |
                                                   I<xsl:value-of select="./@name"/>RoomResponse</xsl:for-each>> {
    try {
      if ('type' in instance) {
        switch (instance.type) {
          case WebMessageType.ErrorResponse:
            return WebSerializer.normalizeErrorResponse(instance).catch((reason) => {
              log.error("Can't normalize ErrorResponse", instance, reason)
              return Promise.reject("Can't normalize ErrorResponse")
            })<xsl:for-each select="/web/events/event">
          case WebMessageType.<xsl:value-of select="./@name"/>EventRequest:
            return WebSerializer.normalize<xsl:value-of select="./@name"/>EventRequest(instance).catch((reason) => {
              log.error("Can't normalize ErrorResponse", instance, reason)
              return Promise.reject("Can't normalize <xsl:value-of select="./@name"/>EventRequest")
            })
          case WebMessageType.<xsl:value-of select="./@name"/>EventResponse:
            return WebSerializer.normalize<xsl:value-of select="./@name"/>EventResponse(instance).catch((reason) => {
              log.error("Can't normalize ErrorResponse", instance, reason)
              return Promise.reject("Can't normalize <xsl:value-of select="./@name"/>EventResponse")
            })</xsl:for-each><xsl:for-each select="/web/rooms/room">
          case WebMessageType.<xsl:value-of select="./@name"/>RoomRequest:
            return WebSerializer.normalize<xsl:value-of select="./@name"/>RoomRequest(instance).catch((reason) => {
              log.error("Can't normalize ErrorResponse", instance, reason)
              return Promise.reject("Can't normalize .<xsl:value-of select="./@name"/>RoomRequest")
            })
          case WebMessageType.<xsl:value-of select="./@name"/>RoomResponse:
            return WebSerializer.normalize<xsl:value-of select="./@name"/>RoomResponse(instance).catch((reason) => {
              log.error("Can't normalize ErrorResponse", instance, reason)
              return Promise.reject("Can't normalize <xsl:value-of select="./@name"/>RoomResponse")
            })</xsl:for-each>
        }
      }<xsl:for-each select="/web/interfaces/interface"> else if (WebSerializer.is<xsl:value-of select="./@name"/>(instance)) {
        return WebSerializer.normalize<xsl:value-of select="./@name"/>(instance)
      }</xsl:for-each>
      log.warn('Can\'t normalize', instance)
      return Promise.reject("Can't normalize")
    } catch (err) {
      log.error("Can't normalize", instance, err)
      return Promise.reject("Can't normalize")
    }
  }

  public static deserialize (str: string): Promise&lt;IErrorResponse<xsl:for-each select="/web/interfaces/interface"> |
                                                   <xsl:value-of select="./@name"/></xsl:for-each><xsl:for-each select="/web/events/event"> |
                                                   I<xsl:value-of select="./@name"/>EventRequest |
                                                   I<xsl:value-of select="./@name"/>EventResponse</xsl:for-each><xsl:for-each select="/web/rooms/room"> |
                                                   I<xsl:value-of select="./@name"/>RoomRequest |
                                                   I<xsl:value-of select="./@name"/>RoomResponse</xsl:for-each>> {
    try {
      const instance = JSON.parse(str)
      if (WebSerializer.isIErrorResponse(instance)) {
        return WebSerializer.deserializeErrorResponse(str)
      }
      return WebSerializer.normalize(instance)
    } catch (err) {
      log.error("Can't parse", str, err)
      return Promise.reject("Can't deserialize")
    }
  }
  public static isIErrorResponse (instance: any): instance is IErrorResponse {
    if (!instance) {
      return false
    }
    if (!('type' in instance)) {
      return false
    }
    return instance.type === WebMessageType.ErrorResponse
  }
  public static isIEventRequest (instance: any): instance is IEventRequest {
    if (!instance) {
      return false
    }<xsl:for-each select="/web/events/event">
    if (WebSerializer.isI<xsl:value-of select="./@name"/>EventRequest(instance)) {
      return true
    }</xsl:for-each>
    return false
  }
  public static isIEventResponse (instance: any): instance is IEventResponse {
    if (!instance) {
      return false
    }<xsl:for-each select="/web/events/event">
    if (WebSerializer.isI<xsl:value-of select="./@name"/>EventResponse(instance)) {
      return true
    }</xsl:for-each>
    return false
  }
  public static isIRoomRequest (instance: any): instance is IRoomRequest {
    if (!instance) {
      return false
    }<xsl:for-each select="/web/rooms/room">
    if (WebSerializer.isI<xsl:value-of select="./@name"/>RoomRequest(instance)) {
      return true
    }</xsl:for-each>
    return false
  }
  public static isIRoomResponse (instance: any): instance is IRoomResponse {
    if (!instance) {
      return false
    }<xsl:for-each select="/web/rooms/room">
    if (WebSerializer.isI<xsl:value-of select="./@name"/>RoomResponse(instance)) {
      return true
    }</xsl:for-each>
    return false
  }
  private static deserializeErrorResponse (str: string): Promise&lt;IErrorResponse> {
    try {
      const obj = JSON.parse(str)
      const errObj = JSON.parse(obj.error)
      return ErrorSerializer.normalizeError(errObj).then((error: IError) => {
        return Promise.resolve({type: WebMessageType.ErrorResponse,
          success: obj.success,
          error: error } as IErrorResponse)
      })
    } catch (e) {
      log.error('Error when deserializeErrorResponse', e)
      return Promise.reject(undefined)
    }
  }
  public static normalizeIRoomRequest (instance: any): Promise&lt;IRoomRequest> {
    if (!instance) {
      return Promise.reject('Instance undefined')
    }<xsl:for-each select="/web/rooms/room">
    if (WebSerializer.isI<xsl:value-of select="./@name"/>RoomRequest(instance)) {
      return WebSerializer.normalize<xsl:value-of select="./@name"/>RoomRequest(instance)
    }</xsl:for-each>
    return Promise.reject('Instance undefined')
  }
  private static normalizeErrorResponse (instance: any): Promise&lt;IErrorResponse> {
    return ErrorSerializer.normalizeError(instance.error).then((error) => {
      return Promise.resolve({type: WebMessageType.ErrorResponse,
        success: instance.success,
        error: error } as IErrorResponse)
    })
  }<xsl:for-each select="/web/events/event">
  public static isI<xsl:value-of select="./@name"/>EventRequest (instance: any): instance is I<xsl:value-of select="./@name"/>EventRequest {
    if (!instance) {
      return false
    }
    if (!('type' in instance)) {
      return false
    }
    return instance.type === WebMessageType.<xsl:value-of select="./@name"/>EventRequest
  }
  public static isI<xsl:value-of select="./@name"/>EventResponse (instance: any): instance is I<xsl:value-of select="./@name"/>EventResponse {
    if (!instance) {
      return false
    }
    if (!('type' in instance)) {
      return false
    }
    return instance.type === WebMessageType.<xsl:value-of select="./@name"/>EventResponse
  }
  private static async normalize<xsl:value-of select="./@name"/>EventRequest (instance: any): Promise&lt;I<xsl:value-of select="./@name"/>EventRequest> {
    let promises: any[] = []
    let result = {type: WebMessageType.<xsl:value-of select="./@name"/>EventRequest<xsl:for-each select="./request/param">,
      <xsl:value-of select="./@name"/>: <xsl:if test="./@optional='true'">instance.<xsl:value-of select="./@name"/> ? </xsl:if><xsl:call-template name="TypeIn">
        <xsl:with-param name="type" select="./@type"/>
        <xsl:with-param name="value">instance.<xsl:value-of select="./@name"/></xsl:with-param>
        <xsl:with-param name="originValue"><xsl:value-of select="./@name"/></xsl:with-param>
      </xsl:call-template><xsl:if test="./@optional='true'"> : undefined</xsl:if>
    </xsl:for-each>
    }
    await Promise.all(promises)
    return Promise.resolve(result as I<xsl:value-of select="./@name"/>EventRequest)
  }
  private static async normalize<xsl:value-of select="./@name"/>EventResponse (instance: any): Promise&lt;I<xsl:value-of select="./@name"/>EventResponse> {
    let promises: any[] = []
    let result = {type: WebMessageType.<xsl:value-of select="./@name"/>EventResponse,
      success: instance.success<xsl:for-each select="./response/param">,
      <xsl:value-of select="./@name"/>: <xsl:if test="./@optional='true'">instance.<xsl:value-of select="./@name"/> ? </xsl:if><xsl:call-template name="TypeIn">
        <xsl:with-param name="type" select="./@type"/>
        <xsl:with-param name="value">instance.<xsl:value-of select="./@name"/></xsl:with-param>
        <xsl:with-param name="originValue"><xsl:value-of select="./@name"/></xsl:with-param>
      </xsl:call-template><xsl:if test="./@optional='true'"> : undefined</xsl:if>
    </xsl:for-each>
    }
    await Promise.all(promises)
    return Promise.resolve(result as I<xsl:value-of select="./@name"/>EventResponse)
  }</xsl:for-each>
  <xsl:for-each select="/web/rooms/room">
  public static isI<xsl:value-of select="./@name"/>RoomRequest (instance: any): instance is I<xsl:value-of select="./@name"/>RoomRequest {
    if (!instance) {
      return false
    }
    if (!('type' in instance)) {
      return false
    }
    return instance.type === WebMessageType.<xsl:value-of select="./@name"/>RoomRequest
  }
  public static isI<xsl:value-of select="./@name"/>RoomResponse (instance: any): instance is I<xsl:value-of select="./@name"/>RoomResponse {
    if (!instance) {
      return false
    }
    if (!('type' in instance)) {
      return false
    }
    return instance.type === WebMessageType.<xsl:value-of select="./@name"/>RoomResponse
  }
  private static async normalize<xsl:value-of select="./@name"/>RoomRequest (instance: any): Promise&lt;I<xsl:value-of select="./@name"/>RoomRequest> {
    let promises: any[] = []
    let result = {type: WebMessageType.<xsl:value-of select="./@name"/>RoomRequest<xsl:for-each select="./request/param">,
      <xsl:value-of select="./@name"/>: <xsl:if test="./@optional='true'">instance.<xsl:value-of select="./@name"/> ? </xsl:if><xsl:call-template name="TypeIn">
        <xsl:with-param name="type" select="./@type"/>
        <xsl:with-param name="value">instance.<xsl:value-of select="./@name"/></xsl:with-param>
        <xsl:with-param name="originValue"><xsl:value-of select="./@name"/></xsl:with-param>
      </xsl:call-template><xsl:if test="./@optional='true'"> : undefined</xsl:if>
    </xsl:for-each>
    }
    await Promise.all(promises)
    return Promise.resolve(result as I<xsl:value-of select="./@name"/>RoomRequest)
  }
  private static async normalize<xsl:value-of select="./@name"/>RoomResponse (instance: any): Promise&lt;I<xsl:value-of select="./@name"/>RoomResponse> {
    let promises: any[] = []
    let result = {type: WebMessageType.<xsl:value-of select="./@name"/>RoomResponse,
      success: instance.success,
      roomID: instance.roomID<xsl:for-each select="./response/param">,
      <xsl:value-of select="./@name"/>: <xsl:if test="./@optional='true'">instance.<xsl:value-of select="./@name"/> ? </xsl:if><xsl:call-template name="TypeIn">
        <xsl:with-param name="type" select="./@type"/>
        <xsl:with-param name="value">instance.<xsl:value-of select="./@name"/></xsl:with-param>
        <xsl:with-param name="originValue"><xsl:value-of select="./@name"/></xsl:with-param>
      </xsl:call-template><xsl:if test="./@optional='true'"> : undefined</xsl:if>
    </xsl:for-each>
    }
    await Promise.all(promises)
    return Promise.resolve(result as I<xsl:value-of select="./@name"/>RoomResponse)
  }</xsl:for-each>
  <xsl:for-each select="/web/interfaces/interface">
  public static is<xsl:value-of select="./@name"/> (instance: any): instance is <xsl:value-of select="./@name"/> {
    if (!instance) {
      return false
    }
    if (<xsl:for-each select="./property[not(@optional) or @optional='false']">'<xsl:value-of select="./@name"/>' in instance<xsl:if test='position() != last()'> &amp;&amp;
        </xsl:if></xsl:for-each>) {
      return true
    }
    return false
  }
  private static async normalize<xsl:value-of select="./@name"/> (instance: any): Promise&lt;<xsl:value-of select="./@name"/>> {
    let promises: any[] = []
    let result = {<xsl:for-each select="./property">
      <xsl:value-of select="./@name"/>: <xsl:if test="./@optional='true'">instance.<xsl:value-of select="./@name"/> ? </xsl:if><xsl:call-template name="TypeIn">
        <xsl:with-param name="type" select="./@type"/>
        <xsl:with-param name="value">instance.<xsl:value-of select="./@name"/></xsl:with-param>
        <xsl:with-param name="originValue"><xsl:value-of select="./@name"/></xsl:with-param>
        <xsl:with-param name="allowAwait" select="'true'"/>
      </xsl:call-template><xsl:if test="./@optional='true'"> : undefined</xsl:if><xsl:if test="position() != last()">,
      </xsl:if>
    </xsl:for-each><xsl:if test="./constbody/front">,
      <xsl:value-of select="./constbody/front"/></xsl:if>
    }
    await Promise.all(promises)
    return Promise.resolve(result as <xsl:value-of select="./@name"/>)
  }</xsl:for-each>
}
</xsl:template>
</xsl:stylesheet>
