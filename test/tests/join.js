var bedrock = GLOBAL.bedrock;

describe('join', function() {
  var identity = {};
  identity.sysIdentifier = bedrock.randomString().toLowerCase();
  identity.id =
    bedrock.baseUrl + bedrock.config.identityBasePath + identity.sysIdentifier;
  identity.label = identity.sysIdentifier;
  identity.email = identity.sysIdentifier + '@bedrock.dev';
  identity.password = 'password';

  it('should create an identity and logout', function() {
    bedrock.pages.join.get().createIdentity(identity);
    bedrock.logout();
  });

  it('should login with the identity\'s slug', function() {
    bedrock.login(identity.sysIdentifier, identity.password);
  });

  it('should logout the identity', function() {
    bedrock.logout();
  });

  it('should login with the identity\'s email', function() {
    bedrock.login(identity.email, identity.password);
  });

  it('should logout the identity', function() {
    bedrock.logout();
  });
});
