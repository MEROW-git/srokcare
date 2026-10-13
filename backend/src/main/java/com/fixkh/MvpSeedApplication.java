package com.fixkh;

import org.springframework.boot.SpringApplication;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.Arrays;

/** Runs the opt-in seed, then closes its temporary server and database pool. */
public final class MvpSeedApplication {
    private MvpSeedApplication() {}

    public static void main(String[] args) {
        SpringApplication application = new SpringApplication(FixKhApplication.class);
        String[] seedArgs = Arrays.copyOf(args, args.length + 5);
        seedArgs[args.length] = "--server.port=0";
        seedArgs[args.length + 1] = "--fixkh.mvp-seed.enabled=true";
        seedArgs[args.length + 2] = "--logging.level.root=WARN";
        seedArgs[args.length + 3] = "--spring.main.banner-mode=off";
        seedArgs[args.length + 4] = "--debug=false";
        try (ConfigurableApplicationContext ignored = application.run(seedArgs)) {
            // ApplicationRunner completed before run() returned.
        }
    }
}
