describe('Application', () => {
  /* class TestModel {
    get password(): string {
      return this._password;
    }

    set password(value: string) {
      this._password = value;
    }

    public body: string;
    private _password: string;
  }

  @Service()
  class TestService {

    @Autowired()
    private readonly routerService: RouterService;

    @Autowired()
    private readonly httpService: HttpService;

    @Autowired()
    private readonly swagger: SwaggerService;

    @RequestMapping('/test/<id:.*?>')
    public testAction(@RequestBody() body: TestModel,
                      @RequestQuery('q') q: string,
                      @RequestPath('id') id: number,
                      logger: LoggerService,
                      @RequestQuery('ids') ids: number[]): ItemModel<TestModel> {
      body.body = 'test';
      logger.render(LOG_LEVEL.INFO, 'test render');
      return new ItemModel(body);
    }
  }

  it('should be create application context', () => {
    const context = new Application();
    context.init();
  });*/
});