package fyipe

import (
	"errors"
	"log"
)

type LoggerOptions struct {
	ApplicationLogId  string
	ApplicationLogKey string
	ApiUrl            string
}

type FyipeLogger struct {
	options LoggerOptions
}

func NewFyipeLogger(options LoggerOptions) (*FyipeLogger, error) {
	if options.ApplicationLogId == "" {
		return nil, errors.New("Application Log ID cant be empty")
	}
	if options.ApplicationLogKey == "" {
		return nil, errors.New("Application Log Key cant be empty")
	}
	if options.ApiUrl == "" {
		return nil, errors.New("API URL cant be empty")
	}
	// set up API URL
	options.ApiUrl = options.ApiUrl + "/application-log/" + options.ApplicationLogId + "/log"

	fyipeLogger := FyipeLogger{
		options: options,
	}
	return &fyipeLogger, nil
}

// Init initializes the SDK with loggerOptions.
// it returns the error if any of the options are invalid
func Init(options LoggerOptions) error {
	currentFyipeLogger, err := NewFyipeLogger(options)
	if err != nil {
		return err
	}
	// confirm Logger is ready to be used by binding user's fyipeLogger
	logger := CurrentLogger()
	logger.BindFyipeLogger(currentFyipeLogger)

	return nil
}

func LogInfo(content string, tags []string) {
	// access fyipe Logger and send an api request
	logger := CurrentLogger()
	var res, err = logger.MakeApiRequest(content, "info", tags)

	if err != nil {
		log.Fatalln(err)
	} else {
		log.Printf(res)
	}
}
