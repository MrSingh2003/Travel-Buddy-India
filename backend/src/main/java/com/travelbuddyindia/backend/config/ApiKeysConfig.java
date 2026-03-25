package com.travelbuddyindia.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "")
public class ApiKeysConfig {

    private Google google = new Google();
    private Searchapi searchapi = new Searchapi();
    private Rapidapi rapidapi = new Rapidapi();
    private Support support = new Support();

    public Google getGoogle() {
        return google;
    }

    public void setGoogle(Google google) {
        this.google = google;
    }

    public Searchapi getSearchapi() {
        return searchapi;
    }

    public void setSearchapi(Searchapi searchapi) {
        this.searchapi = searchapi;
    }

    public Rapidapi getRapidapi() {
        return rapidapi;
    }

    public void setRapidapi(Rapidapi rapidapi) {
        this.rapidapi = rapidapi;
    }

    public Support getSupport() {
        return support;
    }

    public void setSupport(Support support) {
        this.support = support;
    }

    public static class Google {
        private Ai ai = new Ai();
        private Maps maps = new Maps();

        public Ai getAi() {
            return ai;
        }

        public void setAi(Ai ai) {
            this.ai = ai;
        }

        public Maps getMaps() {
            return maps;
        }

        public void setMaps(Maps maps) {
            this.maps = maps;
        }

        public static class Ai {
            private String apiKey;

            public String getApiKey() {
                return apiKey;
            }

            public void setApiKey(String apiKey) {
                this.apiKey = apiKey;
            }
        }

        public static class Maps {
            private String apiKey;

            public String getApiKey() {
                return apiKey;
            }

            public void setApiKey(String apiKey) {
                this.apiKey = apiKey;
            }
        }
    }

    public static class Searchapi {
        private String apiKey;

        public String getApiKey() {
            return apiKey;
        }

        public void setApiKey(String apiKey) {
            this.apiKey = apiKey;
        }
    }

    public static class Rapidapi {
        private String key;
        private String webhookUrl;

        public String getKey() {
            return key;
        }

        public void setKey(String key) {
            this.key = key;
        }

        public String getWebhookUrl() {
            return webhookUrl;
        }

        public void setWebhookUrl(String webhookUrl) {
            this.webhookUrl = webhookUrl;
        }
    }

    public static class Support {
        private Notification notification = new Notification();
        private Mail mail = new Mail();

        public Notification getNotification() {
            return notification;
        }

        public void setNotification(Notification notification) {
            this.notification = notification;
        }

        public Mail getMail() {
            return mail;
        }

        public void setMail(Mail mail) {
            this.mail = mail;
        }

        public static class Notification {
            private String emails;

            public String getEmails() {
                return emails;
            }

            public void setEmails(String emails) {
                this.emails = emails;
            }
        }

        public static class Mail {
            private String from;

            public String getFrom() {
                return from;
            }

            public void setFrom(String from) {
                this.from = from;
            }
        }
    }
}
