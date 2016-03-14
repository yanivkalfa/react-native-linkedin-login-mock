// RNLinkedinLogin.m
//
// Copyright (c) 2015 Jody Brewster
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in all
// copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
// SOFTWARE.

#import "RCTBridge.h"
#import "LinkedinLogin.h"
#import "RCTEventDispatcher.h"

#import "LIALinkedInApplication.h"
#import "LIALinkedInHttpClient.h"
#import "AFHTTPRequestOperationManager.h"

@implementation LinkedinLogin

RCT_EXPORT_MODULE();

@synthesize bridge = _bridge;

@synthesize clientId = _clientId;
@synthesize redirectUrl = _redirectUrl;
@synthesize clientSecret = _clientSecret;
@synthesize state = _state;
@synthesize scopes = _scopes;


RCT_EXPORT_METHOD(getCredentials:(RCTResponseSenderBlock)callback)
{
    NSString *access_Token = [[ NSUserDefaults standardUserDefaults ] objectForKey:@"access_token"];
    if (!access_Token) {
        NSString *err = @"No access token was found";
        NSLog(@"%@", err);
        callback(@[err, [NSNull null]]);
        return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinGetRequestError"
                                                               body:@{@"error": err}];
    }
    AFHTTPRequestOperationManager *manager = [AFHTTPRequestOperationManager manager];
    NSString *url = @"https://api.linkedin.com/v1/people/~:(id,first-name,last-name,industry,email-address)";
    
    NSDictionary *parameters = @{@"oauth2_access_token": access_Token, @"format": @"json"};
    [manager POST:url parameters:parameters success:^(AFHTTPRequestOperation *operation, id responseObject) {
        NSLog(@"JSON: %@", responseObject);
        callback(@[[NSNull null],responseObject]);
        return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinGetRequest"
                                                               body:responseObject];
        
    } failure:^(AFHTTPRequestOperation *operation, NSError *error) {
        NSString *err = [NSString stringWithFormat:@"Request Error: %@", error];
        NSLog(@"%@", err);
        callback(@[err, [NSNull null]]);
        return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinGetRequestError"
                                                               body:@{@"error": err}];
    }];
}


RCT_EXPORT_METHOD(login:(NSString *)clientId redirectUrl:(NSString *)redirectUrl clientSecret:(NSString *)clientSecret state:(NSString *)state scopes:(NSArray *)scopes callback:(RCTResponseSenderBlock)callback)
{
    
    self.clientId = clientId;
    self.redirectUrl = redirectUrl;
    self.clientSecret = clientSecret;
    self.state = state;
    self.scopes = scopes;
    
    
    [self.client getAuthorizationCode:^(NSString *code) {
        [self.client getAccessToken:code success:^(NSDictionary *accessTokenData) {
            NSString *accessToken = [accessTokenData objectForKey:@"access_token"];
            NSString *expiresOn = [accessTokenData objectForKey:@"expires_in"];
            NSDictionary *body = @{@"accessToken": accessToken, @"expiresOn": expiresOn};
            callback(@[[NSNull null], body]);
            return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinLogin"
                                                                   body:body];
            
            
        }                   failure:^(NSError *error) {
            NSString *err = [ NSString stringWithFormat:@"Quering accessToken failed %@",error ];
            NSLog(@"%@", err);
            callback(@[err, [NSNull null]]);
            return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinLoginError"
                                                                   body:@{@"error": error.description}];
        }];
    }                      cancel:^{
        NSString *err = @"Authorization was cancelled by user";
        NSLog(@"%@", err);
        callback(@[err, [NSNull null]]);
        return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinLoginError"
                                                               body:@{@"error": @"User canceled"}];
    }                     failure:^(NSError *error) {
        NSString *err = [ NSString stringWithFormat:@"Authorization failed %@",error ];
        NSLog(@"%@", err);
        callback(@[err, [NSNull null]]);
        return [self.bridge.eventDispatcher sendDeviceEventWithName:@"linkedinLoginError"
                                                               body:@{@"error": error.description}];
    }];
    
}


- (LIALinkedInHttpClient *)client {
    LIALinkedInApplication *application = [LIALinkedInApplication applicationWithRedirectURL:self.redirectUrl
                                                                                    clientId:self.clientId
                                                                                clientSecret:self.clientSecret
                                                                                       state:self.state
                                                                               grantedAccess:self.scopes];
    return [LIALinkedInHttpClient clientForApplication:application presentingViewController:nil];
}



@end
