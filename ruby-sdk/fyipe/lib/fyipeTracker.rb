require_relative 'fyipe/util'
require_relative 'fyipe/fyipeListener'
class FyipeTracker
    # FyipeLogger constructor.
    # @param string apiUrl
    # @param string errorTrackerId
    # @param string errorTrackerKey
    
    def initialize(apiUrl, errorTrackerId, errorTrackerKey, options = [])
        # instance variable intialzation
        @configKeys = ['baseUrl']
        @MAX_ITEMS_ALLOWED_IN_STACK = 100
        @errorTrackerId = errorTrackerId
        setApiUrl(apiUrl) 
        @errorTrackerKey = errorTrackerKey
        @tags = []
        @fingerprint = []
        @options = {
            'maxTimeline': 5
        }
        setUpOptions(options)
        @util = Util.new(@options)
        setEventId()
        @listenerObj = FyipeListener.new(getEventId(), @options)
    end

    def setApiUrl(apiUrl)
        @apiUrl = apiUrl + '/error-tracking/' + @errorTrackerId + '/track';
    end

    def setUpOptions(options)
        # set up options
        if(options.class.to_s != "Hash")
            return # ignore passed options if it is not an object
        end

        options.each do |key, value|
            # proceed with current key if it is not in the config keys
             if (!(@configKeys.include? key))
                # if key is allowed in options
                if (@options[key] != nil)
                     # set max timeline properly after hecking conditions
                     if key.to_s == 'maxTimeline'
                        allowedValue = value
                        if value > @MAX_ITEMS_ALLOWED_IN_STACK or value < 1
                            allowedValue = @MAX_ITEMS_ALLOWED_IN_STACK
                        end
                        
                        @options[key] = allowedValue
                    end
                end

             end
        end
    end

    def setEventId()
        @eventId = @util.v4()
    end
    
    def getEventId()
        return @eventId
    end

    def addToTimeline(category, content, type)
        timelineObj =  {}
        timelineObj["category"] = category
        timelineObj["data"] = content,
        timelineObj["type"] = type

        @listenerObj.logCustomTimelineEvent(timelineObj)
    end

    def getTimeline()
        return @listenerObj.getTimeline()
    end

    def setTag(key, value)
        if (!((key.class.to_s.eql? "String") || (value.class.to_s.eql? "String")))
            raise "Invalid Tag"
        end
        
        exist = false
        @tags.each do |tag|
            if(tag['key'].to_s.eql? key)
                # set the found flag
                exist = true
                # replace value if it exist
                tag['value'] = value
                break
            end
        end
        if(!exist)
            # push key and value if it doesnt
            tag = {}
            tag['key'] = key
            tag['value'] = value
            @tags.append(tag)
        end
    end

    def setTags(tags)
    
        if (!(tags.class.to_s.eql? "Array"))
            raise "Invalid Tags"
        end
        
        tags.each do |tag|
            if(tag[:key] != nil && tag[:value] != nil)
                setTag(tag[:key], tag[:value])
            end
        end
    end

    def getTags()
        return @tags
    end

    def setFingerPrint(key)
        # get data type of the passed key
        keyClassType = key.class.to_s

        # routine check
        if (keyClassType != "String" && keyClassType != "Array")
            raise "Invalid Fingerprint"
        end

        fingerprint = key
        if (keyClassType == "String")
            fingerprint = [key]
        end
        
        @fingerprint = fingerprint
    end

    def getFingerprint(errorMessage)
    
        # if no fingerprint exist currently
        if (@fingerprint.length() < 1)
            # set up finger print based on error since none exist
            setFingerPrint(errorMessage)
        end
        
        return @fingerprint
    end

    def captureMessage( message)
        # set the a handled tag
        setTag('handled', 'true')
        messageObj = {}
        messageObj["message"] = message 

        prepareErrorObject('message', messageObj);

        # TODO send to the server
        # return sendErrorEventToServer()
    end

    def prepareErrorObject(eventType, errorStackTrace) 
        # set a last timeline as the error message
        @listenerObj.logErrorEvent(errorStackTrace["message"], eventType)
        
        # get current timeline
        timeline = getTimeline()
        
        tags = getTags()
        fingerprint = getFingerprint(errorStackTrace["message"]) # default fingerprint will be the message from the error stacktrace
        # get event ID
        # Temporary display the state of the error stack, timeline and device details when an error occur
        # prepare the event so it can be sent to the server
        @event = {}
        @event["type"] = eventType
        @event["timeline"]= timeline
        @event["exception"]= errorStackTrace
        @event["eventId"]= getEventId()
        @event["tags"]= tags
        @event["fingerprint"]= fingerprint
        @event["errorTrackerKey"]= @errorTrackerKey
    end

    def getCurrentEvent()
        puts @event
        return @event
    end
        
end
