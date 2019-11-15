import { Injectable } from '@nestjs/common';
import { ModulesContainer, Reflector } from '@nestjs/core';
import { InstanceWrapper } from '@nestjs/core/injector/instance-wrapper';
import * as EventEmitter from 'events';
import { InjectEventBusModuleOptions } from './event-bus.decorators';
import { EventBusExplorer } from './event-bus.explorer';
import { EventBusModuleOptions, ListenerDecoratorOptions } from './event-bus.interfaces';

@Injectable()
export class EventBusService {
    private readonly event: EventEmitter = new EventEmitter();
    private readonly explorer: EventBusExplorer;

    constructor(
        @InjectEventBusModuleOptions()
        private readonly options: EventBusModuleOptions,
        private readonly modulesContainer: ModulesContainer,
        private readonly reflector: Reflector
    ) {
        this.explorer = new EventBusExplorer(this.modulesContainer, this.reflector, this.handleListener.bind(this));
        this.explorer.explore();
    }

    public emit(eventName: string | symbol, data?: any) {
        return this.event.emit(eventName, data);
    }

    public on(eventName: string | symbol, callback: Callback) {
        this.event.on(eventName, callback);
        return this;
    }

    public once(eventName: string | symbol, callback: Callback) {
        this.event.once(eventName, callback);
        return this;
    }

    private handleListener({ instance }: InstanceWrapper, key: string, options: ListenerDecoratorOptions) {
        return this.on(options.event, instance[key].bind(instance));
    }
}